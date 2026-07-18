import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import path from "path";
import { ensureRuntimeSchema } from "./db-bootstrap";
import { getPrismaClient } from "./prisma-client";
import { upsertConversation, type UiConversation } from "./mock-store";
import { readJsonState, writeJsonState } from "./state-path";

type StoredKommoCredential = {
  accountId: string;
  subdomain: string;
  encryptedPayload: string;
  expiresAt: string | null;
  installedAt: string;
  updatedAt: string;
};

type StoredKommoEvent = {
  eventId: string;
  receivedAt: string;
  conversationId: string | null;
  leadId: string | null;
  contactId: string | null;
  channel: string | null;
  direction: "incoming" | "outgoing" | "unknown";
  text: string | null;
  raw: unknown;
};

type KommoState = {
  credentials: StoredKommoCredential | null;
  events: StoredKommoEvent[];
};

const DEFAULT_STATE: KommoState = {
  credentials: null,
  events: []
};

const KOMMO_STATE_FILE = "kommo-state.json";
const KOMMO_STATE_LEGACY_PATHS = [
  path.resolve(process.cwd(), "../../work/kommo-state.json"),
  path.resolve(process.cwd(), "../work/kommo-state.json"),
  path.resolve(process.cwd(), "work/kommo-state.json")
];

function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function readCredentialFromDatabase(): Promise<StoredKommoCredential | null> {
  await ensureRuntimeSchema();
  const prisma = await getPrismaClient();

  try {
    const credential = await prisma.kommoCredential.findFirst({
      orderBy: { updatedAt: "desc" }
    });

    if (!credential) return null;

    return {
      accountId: credential.accountId,
      subdomain: credential.subdomain,
      encryptedPayload: credential.encryptedPayload,
      expiresAt: credential.accessTokenExpiresAt ? credential.accessTokenExpiresAt.toISOString() : null,
      installedAt: credential.createdAt.toISOString(),
      updatedAt: credential.updatedAt.toISOString()
    };
  } catch {
    return null;
  }
}

async function writeCredentialToDatabase(input: StoredKommoCredential) {
  await ensureRuntimeSchema();
  const prisma = await getPrismaClient();

  try {
    await prisma.kommoCredential.upsert({
      where: { accountId: input.accountId },
      create: {
        accountId: input.accountId,
        subdomain: input.subdomain,
        encryptedPayload: input.encryptedPayload,
        accessTokenExpiresAt: input.expiresAt ? new Date(input.expiresAt) : null
      },
      update: {
        subdomain: input.subdomain,
        encryptedPayload: input.encryptedPayload,
        accessTokenExpiresAt: input.expiresAt ? new Date(input.expiresAt) : null
      }
    });
    return true;
  } catch {
    return false;
  }
}

async function recordWebhookEventToDatabase(input: StoredKommoEvent) {
  await ensureRuntimeSchema();
  const prisma = await getPrismaClient();

  try {
    await prisma.webhookEvent.upsert({
      where: { externalEventId: input.eventId },
      create: {
        externalEventId: input.eventId,
        eventType: "kommo.message",
        rawPayload: input.raw,
        source: input.channel ?? "Kommo",
        receivedAt: new Date(input.receivedAt),
        status: "received"
      },
      update: {
        rawPayload: input.raw,
        source: input.channel ?? "Kommo",
        receivedAt: new Date(input.receivedAt),
        status: "received"
      }
    });
    return true;
  } catch {
    return false;
  }
}

async function readState(): Promise<KommoState> {
  if (shouldUseDatabase()) {
    const credential = await readCredentialFromDatabase();
    if (credential) {
      return {
        credentials: credential,
        events: []
      };
    }
  }

  return readJsonState({
    fileName: KOMMO_STATE_FILE,
    defaultState: DEFAULT_STATE,
    legacyFilePaths: KOMMO_STATE_LEGACY_PATHS
  });
}

async function writeState(nextState: KommoState) {
  if (shouldUseDatabase() && nextState.credentials) {
    const saved = await writeCredentialToDatabase(nextState.credentials);
    if (saved) {
      return nextState;
    }
  }

  return writeJsonState({
    fileName: KOMMO_STATE_FILE,
    state: nextState
  });
}

function getEncryptionKey() {
  const raw = process.env.ENCRYPTION_KEY ?? "";
  if (!raw) {
    return createHash("sha256").update("pallet-pros-kommo-dev-fallback").digest();
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  try {
    return Buffer.from(raw, "base64");
  } catch {
    return createHash("sha256").update(raw).digest();
  }
}

function encryptJson(payload: unknown) {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

function decryptJson<T>(encoded: string): T {
  const bytes = Buffer.from(encoded, "base64");
  const iv = bytes.subarray(0, 12);
  const authTag = bytes.subarray(12, 28);
  const encrypted = bytes.subarray(28);
  const key = getEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}

export function buildKommoAuthUrl(state: string) {
  const subdomain = process.env.KOMMO_SUBDOMAIN ?? "";
  const clientId = process.env.KOMMO_CLIENT_ID ?? "";
  const redirectUri = process.env.KOMMO_REDIRECT_URI ?? "";

  if (!subdomain || !clientId || !redirectUri) {
    throw new Error("Kommo OAuth env vars are not fully configured");
  }

  const url = new URL("https://www.kommo.com/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("state", state);
  url.searchParams.set("mode", "post_message");
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
}

export async function exchangeKommoToken(input: {
  code: string;
  grantType: "authorization_code" | "refresh_token";
  refreshToken?: string;
}) {
  const subdomain = process.env.KOMMO_SUBDOMAIN ?? "";
  const clientId = process.env.KOMMO_CLIENT_ID ?? "";
  const clientSecret = process.env.KOMMO_CLIENT_SECRET ?? "";
  const redirectUri = process.env.KOMMO_REDIRECT_URI ?? "";

  if (!subdomain || !clientId || !clientSecret || !redirectUri) {
    throw new Error("Kommo OAuth env vars are not fully configured");
  }

  const response = await fetch(`https://${subdomain}.kommo.com/oauth2/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: input.grantType,
      code: input.grantType === "authorization_code" ? input.code : undefined,
      refresh_token: input.grantType === "refresh_token" ? input.refreshToken : undefined,
      redirect_uri: redirectUri
    })
  });

  if (!response.ok) {
    throw new Error(`Kommo token exchange failed with ${response.status}`);
  }

  return response.json() as Promise<{
    token_type: string;
    expires_in: number;
    server_time: number;
    access_token: string;
    refresh_token: string;
  }>;
}

export async function fetchKommoAccount(accessToken: string, subdomain: string) {
  const response = await fetch(`https://${subdomain}.kommo.com/api/v4/account?with=amojo_id`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Kommo account lookup failed with ${response.status}`);
  }

  return response.json() as Promise<{ id: number; subdomain: string; amojo_id?: string }>;
}

export async function saveKommoCredential(input: {
  accountId: string;
  subdomain: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date | null;
}) {
  const state = await readState();
  const encryptedPayload = encryptJson({
    accessToken: input.accessToken,
    refreshToken: input.refreshToken
  });

  const nextState: KommoState = {
    ...state,
    credentials: {
      accountId: input.accountId,
      subdomain: input.subdomain,
      encryptedPayload,
      expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
      installedAt: state.credentials?.installedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  if (shouldUseDatabase()) {
    const credential = nextState.credentials;
    if (credential) {
      const saved = await writeCredentialToDatabase(credential);
      if (saved) {
        return { encryptedPayload, credential };
      }
    }
  }

  await writeState(nextState);
  return { encryptedPayload, credential: nextState.credentials };
}

export async function readKommoCredential() {
  const state = await readState();
  if (!state.credentials) return null;

  const payload = decryptJson<{ accessToken: string; refreshToken: string }>(state.credentials.encryptedPayload);
  return {
    accountId: state.credentials.accountId,
    subdomain: state.credentials.subdomain,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt: state.credentials.expiresAt,
    installedAt: state.credentials.installedAt,
    updatedAt: state.credentials.updatedAt
  };
}

export async function recordKommoEvent(input: {
  eventId: string;
  receivedAt: string;
  conversationId: string | null;
  leadId: string | null;
  contactId: string | null;
  channel: string | null;
  direction: "incoming" | "outgoing" | "unknown";
  text: string | null;
  raw: unknown;
}) {
  if (shouldUseDatabase()) {
    await recordWebhookEventToDatabase(input);
  }

  const state = await readState();
  const nextEvents = [
    {
      ...input,
      raw: input.raw
    },
    ...state.events.filter((event) => event.eventId !== input.eventId)
  ].slice(0, 200);

  await writeState({
    ...state,
    events: nextEvents
  });
}

export async function ingestKommoWebhookEvent(input: {
  eventId: string;
  receivedAt: string;
  conversationId: string | null;
  leadId: string | null;
  contactId: string | null;
  channel: string | null;
  direction: "incoming" | "outgoing" | "unknown";
  text: string | null;
  leadLabel: string;
  raw: unknown;
}) {
  await recordKommoEvent(input);

  if (input.conversationId) {
    const latestIncomingAt = input.direction === "incoming" ? new Date(input.receivedAt).toISOString() : new Date().toISOString();
    const latestIncoming = input.text ?? "New message received";
    const conversation: UiConversation = {
      id: input.conversationId,
      lead: input.leadLabel,
      leadId: input.leadId ?? input.conversationId,
      contactId: input.contactId ?? input.conversationId,
      conversationId: input.conversationId,
      channel: input.channel ?? "Kommo",
      latestIncoming,
      confidence: "0.91",
      status: "needs review",
      stage: "qualifying",
      note: "Live Kommo webhook event received.",
      replyDraft: "",
      action: "approval_required",
      updatedAt: new Date().toISOString(),
      lastIncomingAt: latestIncomingAt
    };

    await upsertConversation(conversation);
  }

  return { ok: true };
}

export function decryptKommoPayload<T>(encryptedPayload: string) {
  return decryptJson<T>(encryptedPayload);
}
