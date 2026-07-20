import { z } from "zod";

const PayloadSchema = z.object({
  payload: z.unknown()
});

export async function processWebhookEvent(job: { eventId: string; receivedAt: string; payload: unknown }) {
  const parsed = PayloadSchema.parse({ payload: job.payload });
  const payloadText = typeof parsed.payload === "string" ? parsed.payload : JSON.stringify(parsed.payload);
  return {
    eventId: job.eventId,
    normalizedPreview: payloadText.slice(0, 500)
  };
}
