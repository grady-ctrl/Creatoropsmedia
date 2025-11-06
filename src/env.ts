import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),

    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    GOOGLE_SHEETS_CREDS_JSON: z.string().optional(),
    GOOGLE_SHEETS_FOLDER_ID: z.string().optional(),

    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    DISCORD_SUPPORT_CHANNEL_URL: z.string().url().optional(),

    LARK_WEBHOOK_URL: z.string().url().optional(),
    LARK_ESCALATION_CHAT_ID: z.string().optional(),

    NOTION_API_KEY: z.string().optional(),
    NOTION_DB_CREATORS: z.string().optional(),
    NOTION_DB_PAYOUTS: z.string().optional(),
    NOTION_DB_MANAGERS: z.string().optional(),

    REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    ZAPIER_WEBHOOK_SECRET: z.string().optional(),
    CRON_SECRET: z.string().optional(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    GOOGLE_SHEETS_CREDS_JSON: process.env.GOOGLE_SHEETS_CREDS_JSON,
    GOOGLE_SHEETS_FOLDER_ID: process.env.GOOGLE_SHEETS_FOLDER_ID,

    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    DISCORD_SUPPORT_CHANNEL_URL: process.env.DISCORD_SUPPORT_CHANNEL_URL,

    LARK_WEBHOOK_URL: process.env.LARK_WEBHOOK_URL,
    LARK_ESCALATION_CHAT_ID: process.env.LARK_ESCALATION_CHAT_ID,

    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_DB_CREATORS: process.env.NOTION_DB_CREATORS,
    NOTION_DB_PAYOUTS: process.env.NOTION_DB_PAYOUTS,
    NOTION_DB_MANAGERS: process.env.NOTION_DB_MANAGERS,

    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    ZAPIER_WEBHOOK_SECRET: process.env.ZAPIER_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,

    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
