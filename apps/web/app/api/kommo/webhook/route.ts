import { NextResponse } from "next/server";
import {
  KommoWebhookEnvelopeSchema,
  extractKommoWebhookEventDetails
} from "@pallet-pros/core";
import { ingestKommoWebhookEvent } from "@/src/lib/kommo-store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "Kommo webhook endpoint is live."
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const parsed = KommoWebhookEnvelopeSchema.safeParse(rawBody ? JSON.parse(rawBody) : {});

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const details = extractKommoWebhookEventDetails(parsed.data);
  await ingestKommoWebhookEvent({
    eventId: details.eventId,
    receivedAt: new Date().toISOString(),
    conversationId: details.conversationId,
    leadId: details.leadId,
    contactId: details.contactId,
    channel: details.channel,
    direction: details.direction,
    text: details.text,
    leadLabel: details.leadLabel,
    raw: parsed.data
  });

  return NextResponse.json({
    ok: true,
    accepted: true,
    receivedAt: new Date().toISOString(),
    note: "Webhook intake stored the Kommo event locally."
  });
}
