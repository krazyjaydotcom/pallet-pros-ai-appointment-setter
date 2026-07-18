import { z } from "zod";
import { normalizeLeadMessage } from "@pallet-pros/core";

const PayloadSchema = z.object({
  payload: z.unknown()
});

export async function processWebhookEvent(job: { eventId: string; receivedAt: string; payload: unknown }) {
  const parsed = PayloadSchema.parse({ payload: job.payload });
  return {
    eventId: job.eventId,
    normalizedPreview: normalizeLeadMessage(typeof parsed.payload === "string" ? parsed.payload : JSON.stringify(parsed.payload))
  };
}
