import { z } from "zod";

export const KommoWebhookEnvelopeSchema = z.object({
  lead: z
    .object({
      event: z.record(z.any()).optional()
    })
    .optional(),
  account: z.record(z.any()).optional(),
  conversation: z.record(z.any()).optional(),
  message: z.record(z.any()).optional(),
  data: z.record(z.any()).optional()
});

export type KommoWebhookEnvelope = z.infer<typeof KommoWebhookEnvelopeSchema>;

export type KommoLeadContext = {
  accountId: string;
  leadId: string | null;
  contactId: string | null;
  conversationId: string | null;
  channel: string | null;
  latestIncomingAt: Date | null;
  latestLeadMessage: string | null;
};

export type KommoOutgoingMessage = {
  conversationId: string;
  leadId?: string | null;
  contactId?: string | null;
  text: string;
  idempotencyKey: string;
};

export interface KommoClient {
  verifyWebhook?(rawBody: string, headers: Headers): Promise<boolean>;
  parseWebhook(rawBody: string): KommoWebhookEnvelope;
  extractConversationContext(event: KommoWebhookEnvelope): KommoLeadContext;
  fetchConversationHistory(input: { conversationId: string }): Promise<Array<{ id: string; text: string; direction: "incoming" | "outgoing"; createdAt: string }>>;
  sendMessage(message: KommoOutgoingMessage): Promise<{ externalMessageId: string; raw: unknown }>;
  refreshTokens?(): Promise<void>;
}

export function normalizeLeadMessage(text: string | null | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export type KommoWebhookEventDetails = {
  eventId: string;
  direction: "incoming" | "outgoing" | "unknown";
  conversationId: string | null;
  leadId: string | null;
  contactId: string | null;
  channel: string | null;
  text: string | null;
  createdAt: string | null;
  accountId: string | null;
  leadLabel: string;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumberString(value: unknown): string | null {
  return typeof value === "number" || typeof value === "string" ? String(value) : null;
}

export function extractKommoWebhookEventDetails(event: KommoWebhookEnvelope): KommoWebhookEventDetails {
  const payload = event.lead?.event ?? event.message ?? event.data ?? event.conversation ?? event.account ?? {};
  const chat = (payload as { chat?: Record<string, unknown> }).chat ?? {};
  const message = (payload as { message?: Record<string, unknown> }).message ?? {};

  const eventId =
    asString((payload as { id?: unknown }).id) ??
    asString(message.id) ??
    asString(chat.conversation_id) ??
    `kommo-${Date.now()}`;

  const conversationId =
    asString(chat.conversation_id) ??
    asString((payload as { conversation_id?: unknown }).conversation_id) ??
    asString((payload as { conversationId?: unknown }).conversationId) ??
    null;

  const leadId =
    asString(chat.lead_id) ??
    asString((payload as { lead_id?: unknown }).lead_id) ??
    asString((payload as { leadId?: unknown }).leadId) ??
    null;

  const contactId =
    asString(chat.contact_id) ??
    asString((payload as { contact_id?: unknown }).contact_id) ??
    asString((payload as { contactId?: unknown }).contactId) ??
    null;

  const channel = asString(chat.channel) ?? asString((payload as { channel?: unknown }).channel) ?? null;
  const text = normalizeLeadMessage(
    asString(message.text) ??
      asString((payload as { text?: unknown }).text) ??
      asString((payload as { body?: unknown }).body)
  );
  const createdAtValue = asNumberString(message.created_at) ?? asNumberString((payload as { created_at?: unknown }).created_at);
  const createdAt = createdAtValue ? new Date(Number(createdAtValue) * 1000 || Number(createdAtValue)).toISOString() : null;
  const direction =
    asString(message.direction) ??
    asString((payload as { direction?: unknown }).direction) ??
    asString((payload as { type?: unknown }).type) ??
    "unknown";

  const accountId =
    asString((event.account as { id?: unknown } | undefined)?.id) ??
    asString((event.account as { amojo_id?: unknown } | undefined)?.amojo_id) ??
    null;

  const leadLabel = [leadId ? `Lead ${leadId}` : null, contactId ? `Contact ${contactId}` : null].filter(Boolean).join(" / ") || "Kommo lead";

  return {
    eventId,
    direction: direction === "incoming" || direction === "outgoing" ? direction : "unknown",
    conversationId,
    leadId,
    contactId,
    channel,
    text,
    createdAt,
    accountId,
    leadLabel
  };
}
