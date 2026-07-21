import { NextResponse } from "next/server";
import {
  normalizeKommoWebhookPayload,
  recordKommoWebhookEvent,
  upsertKommoConversation
} from "@/src/lib/kommo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/kommo/webhook",
    method: "POST",
    description: "Kommo webhook intake endpoint"
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const normalized = normalizeKommoWebhookPayload(payload);
  const stored = await recordKommoWebhookEvent({
    eventId: normalized.eventId,
    eventType: normalized.eventType,
    payload,
    redactedPayload: normalized.redactedPayload
  });

  if (!stored.duplicate) {
    await upsertKommoConversation(normalized);
  }

  return NextResponse.json({
    ok: true,
    duplicate: stored.duplicate,
    eventId: normalized.eventId,
    eventType: normalized.eventType,
    conversationId: normalized.conversationId,
    leadName: normalized.leadName,
    latestIncoming: normalized.latestIncoming
  });
}
