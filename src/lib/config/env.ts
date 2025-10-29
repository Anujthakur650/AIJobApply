import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    STORAGE_BUCKET: z.string().optional(),
    STORAGE_REGION: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    VECTOR_DB_ENVIRONMENT: z.string().optional(),
    VECTOR_DB_API_KEY: z.string().optional(),
    VECTOR_DB_INDEX: z.string().optional(),
    SCRAPER_PROXY_ROTATION_SECRET: z.string().optional(),
    CAPTCHA_API_KEY: z.string().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    LINKEDIN_CLIENT_ID: z.string().optional(),
    LINKEDIN_CLIENT_SECRET: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    RESUME_MAX_FILE_SIZE_MB: z.coerce.number().default(5),
    APP_BASE_URL: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM_NUMBER: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().optional(),
    POSTHOG_API_KEY: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
  })
  .transform((values) => ({
    ...values,
    isProduction: values.NODE_ENV === "production",
    isTest: values.NODE_ENV === "test",
  }));

type Env = z.infer<typeof envSchema> & {
  isProduction: boolean;
  isTest: boolean;
};

type EnvKey = Exclude<keyof Env, "isProduction" | "isTest">;

let parsedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (parsedEnv) {
    return parsedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(result.error.message);
  }

  parsedEnv = result.data;
  return parsedEnv;
};

export const requireEnv = (key: EnvKey) => {
  const env = getEnv();
  const value = env[key];

  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }

  return value;
};
