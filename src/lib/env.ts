import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z
    .string()
    .min(1)
    .default("insecure-development-secret"),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("AIJobApply"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
