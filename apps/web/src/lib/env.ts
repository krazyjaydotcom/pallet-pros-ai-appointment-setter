import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
  APP_STATE_DIR: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  KOMMO_SUBDOMAIN: z.string().optional(),
  KOMMO_CLIENT_ID: z.string().optional(),
  KOMMO_CLIENT_SECRET: z.string().optional(),
  KOMMO_REDIRECT_URI: z.string().optional(),
  KOMMO_ACCESS_TOKEN: z.string().optional(),
  KOMMO_REFRESH_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_REASONING_EFFORT: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().optional(),
  OPERATING_MODE: z.string().optional(),
  AUTO_SEND_CONFIDENCE_THRESHOLD: z.string().optional(),
  MESSAGE_DEBOUNCE_SECONDS: z.string().optional(),
  MESSAGE_WINDOW_HOURS: z.string().optional(),
  TRAINING_URL: z.string().optional(),
  BOOKING_URL: z.string().optional(),
  BUSINESS_TIMEZONE: z.string().optional()
});

export const env = envSchema.parse(process.env);
