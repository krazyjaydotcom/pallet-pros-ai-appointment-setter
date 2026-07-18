import "server-only";

import { getPrismaClient } from "./prisma-client";

const BOOTSTRAP_STATEMENTS = [
  `
  CREATE TABLE IF NOT EXISTS "AppSetting" (
    "id" text PRIMARY KEY,
    "key" text NOT NULL UNIQUE,
    "value" jsonb NOT NULL,
    "updatedById" text,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS "KommoCredential" (
    "id" text PRIMARY KEY,
    "accountId" text NOT NULL UNIQUE,
    "subdomain" text NOT NULL,
    "encryptedPayload" text NOT NULL,
    "accessTokenExpiresAt" timestamp(3),
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" text PRIMARY KEY,
    "externalEventId" text UNIQUE,
    "eventType" text NOT NULL,
    "rawPayload" jsonb NOT NULL,
    "redactedPayload" jsonb,
    "source" text,
    "receivedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" timestamp(3),
    "dedupeHash" text UNIQUE,
    "status" text NOT NULL DEFAULT 'received'
  )
  `
] as const;

let bootstrapPromise: Promise<void> | null = null;

export async function ensureRuntimeSchema() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const prisma = await getPrismaClient();

      for (const statement of BOOTSTRAP_STATEMENTS) {
        await prisma.$executeRawUnsafe(statement);
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
