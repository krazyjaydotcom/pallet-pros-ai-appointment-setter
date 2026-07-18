import IORedis from "ioredis";

export type AppQueueJob = {
  eventId: string;
  receivedAt: string;
  payload: unknown;
};

export function createRedisConnection(url: string) {
  return new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false
  });
}
