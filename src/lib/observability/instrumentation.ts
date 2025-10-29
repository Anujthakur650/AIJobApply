import * as Sentry from "@sentry/nextjs";
import { PostHog } from "posthog-node";
import { getEnv } from "@/lib/config/env";

const env = getEnv();

let posthogClient: PostHog | null = null;

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

if (env.POSTHOG_API_KEY) {
  posthogClient = new PostHog(env.POSTHOG_API_KEY, {
    host: "https://us.posthog.com",
  });
}

export const captureEvent = (
  name: string,
  properties: Record<string, unknown>
) => {
  if (posthogClient) {
    posthogClient.capture({
      distinctId: properties.userId ? String(properties.userId) : "anonymous",
      event: name,
      properties,
    });
  }
};

export const captureError = (error: unknown) => {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
};
