import { Queue, Worker, QueueEvents } from "bullmq";
import { z } from "zod";
import { createRedisConnection, type AppQueueJob } from "./queue";
import { processWebhookEvent } from "./jobs/process-webhook-event";

const envSchema = z.object({
  REDIS_URL: z.string().min(1),
  NODE_ENV: z.string().optional()
});

const env = envSchema.parse(process.env);
const connection = createRedisConnection(env.REDIS_URL);

export const webhookQueue = new Queue<AppQueueJob>("webhook-events", { connection });
export const webhookQueueEvents = new QueueEvents("webhook-events", { connection });

export const worker = new Worker<AppQueueJob>(
  "webhook-events",
  async (job) => processWebhookEvent(job.data),
  { connection }
);

worker.on("failed", (job, error) => {
  console.error("webhook job failed", { jobId: job?.id, error: error.message });
});

worker.on("completed", (job) => {
  console.log("webhook job completed", { jobId: job.id });
});

if (process.env.NODE_ENV !== "test") {
  console.log("Pallet Pros worker started");
}
