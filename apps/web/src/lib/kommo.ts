import crypto from "crypto";
import { Prisma } from "@pallet-pros/db";
import { z } from "zod";
import { resolveAppBaseUrl as resolveConfiguredAppBaseUrl } from "./app-url";
import { ensureRuntimeSchema } from "./db-bootstrap";
import { env } from "./env";
import { getPrismaClient } from "./prisma-client";
import { type UiConversation, upsertConversation } from "./mock-store";

const KOMMO_OAUTH_STATE_COOKIE = "ppaa_kommo_oauth_state";
const KOMMO_TOKENS_SETTING_KEY = "kommo.oauth.tokens";

const kommoTokenResponseSchema = z.object({
  token_type: z.string().optional(),
  expires_in: z.number().int().positive(),
  server_time: z.number().int().optional(),
  access_token: z.string().min(1),
  refresh_token: z.string().min(1)
});

type KommoPrimitive = string | number | boolean | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getPathValue(input: unknown, path: Array<string | number>) {
  let current: unknown = input;

  for (const segment of path) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof segment === "number") {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[segment];
      continue;
    }

    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function firstString(input: unknown, paths: Array<Array<string | number>>) {
  for (const path of paths) {
    const value = getPathValue(input, path);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function compactJson(input: unknown) {
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

function resolveAppBaseUrl(requestUrl?: string) {
  if (env.APP_BASE_URL?.trim() || env.KOMMO_REDIRECT_URI?.trim()) {
    return resolveConfiguredAppBaseUrl();
  }

  if (!requestUrl) {
    return resolveConfiguredAppBaseUrl();
  }

  const requestOrigin = new URL(requestUrl).origin;

  return resolveConfiguredAppBaseUrl({
    get(name: string) {
      if (name === "host") {
        return new URL(requestOrigin).host;
      }
      if (name === "x-forwarded-proto") {
        return new URL(requestOrigin).protocol.replace(":", "");
      }
      return null;
    }
  });
}

export function resolveKommoRedirectUri(requestUrl?: string) {
  return env.KOMMO_REDIRECT_URI?.trim() || new URL("/api/kommo/oauth/callback", resolveAppBaseUrl(requestUrl)).toString();
}

export function buildKommoAuthorizationUrl(input: { state: string; mode?: "popup" | "post_message" }) {
  if (!env.KOMMO_CLIENT_ID?.trim()) {
    throw new Error("KOMMO_CLIENT_ID is not configured.");
  }

  const url = new URL("https://www.kommo.com/oauth");
  url.searchParams.set("client_id", env.KOMMO_CLIENT_ID.trim());
  url.searchParams.set("state", input.state);
  url.searchParams.set("mode", input.mode ?? "post_message");
  return url.toString();
}

export function getKommoOAuthConfig(requestUrl?: string) {
  const subdomain = env.KOMMO_SUBDOMAIN?.trim();
  const clientId = env.KOMMO_CLIENT_ID?.trim();
  const clientSecret = env.KOMMO_CLIENT_SECRET?.trim();
  const redirectUri = resolveKommoRedirectUri(requestUrl);

  if (!subdomain || !clientId || !clientSecret) {
    throw new Error("Kommo OAuth env is incomplete. Set KOMMO_SUBDOMAIN, KOMMO_CLIENT_ID, and KOMMO_CLIENT_SECRET.");
  }

  return { subdomain, clientId, clientSecret, redirectUri };
}

export function buildKommoOAuthStartUrl(state: string) {
  return buildKommoAuthorizationUrl({ state });
}

export async function exchangeKommoAuthorizationCode(input: {
  code: string;
  requestUrl?: string;
}) {
  const config = getKommoOAuthConfig(input.requestUrl);
  const response = await fetch(`https://${config.subdomain}.kommo.com/oauth2/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: config.redirectUri
    })
  });

  const rawBody = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `Kommo token exchange failed with status ${response.status}${rawBody ? `: ${compactJson(rawBody)}` : ""}`
    );
  }

  const parsed = kommoTokenResponseSchema.parse(rawBody);
  const expiresAt = new Date(Date.now() + parsed.expires_in * 1000).toISOString();

  return {
    ...parsed,
    expiresAt,
    subdomain: config.subdomain,
    clientId: config.clientId,
    redirectUri: config.redirectUri
  };
}

export async function saveKommoOAuthTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expiresAt: string;
  subdomain: string;
  clientId: string;
  redirectUri: string;
}) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  await ensureRuntimeSchema();
  const prisma = await getPrismaClient();
  const now = new Date().toISOString();

  await prisma.appSetting.upsert({
    where: { key: KOMMO_TOKENS_SETTING_KEY },
    create: {
      key: KOMMO_TOKENS_SETTING_KEY,
      value: {
        ...tokens,
        savedAt: now
      }
    },
    update: {
      value: {
        ...tokens,
        savedAt: now
      }
    }
  });

  return tokens;
}

export function getKommoOAuthStateCookieName() {
  return KOMMO_OAUTH_STATE_COOKIE;
}

export function createKommoOAuthStateCookieValue() {
  return crypto.randomUUID();
}

export function serializeKommoOAuthStateCookie(state: string) {
  const parts = [
    `${KOMMO_OAUTH_STATE_COOKIE}=${state}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=900"
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearKommoOAuthStateCookie() {
  const parts = [
    `${KOMMO_OAUTH_STATE_COOKIE}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0"
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export type KommoNormalizedWebhookEvent = {
  eventId: string;
  eventType: string;
  conversationId: string;
  leadId: string;
  contactId: string;
  leadName: string;
  channel: string;
  latestIncoming: string;
  confidence: string;
  stage: string;
  note: string;
  replyDraft: string;
  status: UiConversation["status"];
  incomingAt: string;
  rawPayload: unknown;
  redactedPayload: Record<string, KommoPrimitive>;
};

export function normalizeKommoWebhookPayload(payload: unknown): KommoNormalizedWebhookEvent {
  const fallbackHash = crypto.createHash("sha256").update(compactJson(payload)).digest("hex");
  const eventId =
    firstString(payload, [
      ["event_id"],
      ["eventId"],
      ["id"],
      ["payload", "id"],
      ["message", "id"],
      ["message_id"],
      ["uuid"],
      ["event", "id"]
    ]) ?? fallbackHash.slice(0, 24);

  const eventType =
    firstString(payload, [
      ["event_type"],
      ["eventType"],
      ["type"],
      ["event", "type"],
      ["action"],
      ["payload", "type"]
    ]) ?? "incoming_message_received";

  const conversationId =
    firstString(payload, [
      ["conversation", "id"],
      ["conversation_id"],
      ["conversationId"],
      ["chat", "id"],
      ["chat_id"],
      ["thread", "id"]
    ]) ?? `kommo-${fallbackHash.slice(0, 16)}`;

  const leadId =
    firstString(payload, [
      ["lead", "id"],
      ["lead_id"],
      ["leadId"],
      ["entity", "id"],
      ["contact", "lead_id"]
    ]) ?? conversationId;

  const contactId =
    firstString(payload, [
      ["contact", "id"],
      ["contact_id"],
      ["contactId"],
      ["chat", "contact_id"],
      ["client", "id"]
    ]) ?? leadId;

  const leadName =
    firstString(payload, [
      ["lead", "name"],
      ["contact", "name"],
      ["name"],
      ["customer", "name"],
      ["from", "name"]
    ]) ?? "Kommo lead";

  const channel =
    firstString(payload, [
      ["channel"],
      ["source"],
      ["chat", "channel"],
      ["integration", "name"],
      ["platform"]
    ]) ?? "Instagram";

  const latestIncoming =
    firstString(payload, [
      ["message", "text"],
      ["message", "body"],
      ["messages", 0, "text"],
      ["messages", 0, "body"],
      ["payload", "text"],
      ["payload", "message", "text"],
      ["text"],
      ["body"],
      ["content"],
      ["comment"]
    ]) ?? compactJson(payload).slice(0, 500);

  const stage =
    firstString(payload, [
      ["lead", "stage"],
      ["stage"],
      ["lead_stage"],
      ["leadStage"]
    ]) ?? "new lead";

  const incomingAt =
    firstString(payload, [
      ["created_at"],
      ["createdAt"],
      ["timestamp"],
      ["time"],
      ["message", "created_at"],
      ["message", "createdAt"]
    ]) ?? new Date().toISOString();

  return {
    eventId,
    eventType,
    conversationId,
    leadId,
    contactId,
    leadName,
    channel,
    latestIncoming,
    confidence: "0.50",
    stage,
    note: "Received from Kommo webhook.",
    replyDraft: "",
    status: "needs review",
    incomingAt,
    rawPayload: payload,
    redactedPayload: {
      eventId,
      eventType,
      conversationId,
      leadId,
      contactId,
      leadName,
      channel,
      latestIncoming,
      stage,
      incomingAt
    }
  };
}

export async function recordKommoWebhookEvent(event: {
  eventId: string;
  eventType: string;
  payload: unknown;
  redactedPayload: unknown;
}) {
  if (!process.env.DATABASE_URL) {
    return { stored: false, duplicate: false };
  }

  await ensureRuntimeSchema();
  const prisma = await getPrismaClient();
  const dedupeHash = crypto.createHash("sha256").update(compactJson(event.payload)).digest("hex");

  try {
    await prisma.webhookEvent.create({
      data: {
        externalEventId: event.eventId,
        eventType: event.eventType,
        rawPayload: event.payload as Prisma.InputJsonValue,
        redactedPayload: event.redactedPayload as Prisma.InputJsonValue,
        source: "kommo",
        dedupeHash
      }
    });
    return { stored: true, duplicate: false };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { stored: false, duplicate: true };
    }

    throw error;
  }
}

export async function upsertKommoConversation(event: KommoNormalizedWebhookEvent) {
  const stateConversation: UiConversation = {
    id: `kommo-${event.conversationId}`,
    lead: event.leadName,
    leadId: event.leadId,
    contactId: event.contactId,
    conversationId: event.conversationId,
    channel: event.channel,
    latestIncoming: event.latestIncoming,
    confidence: event.confidence,
    status: event.status,
    stage: event.stage,
    note: event.note,
    replyDraft: event.replyDraft,
    action: "approval_required",
    updatedAt: event.incomingAt,
    lastIncomingAt: event.incomingAt
  };

  return upsertConversation(stateConversation);
}
