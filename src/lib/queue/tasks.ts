import type { JobsOptions } from "bullmq";
import { initializeQueues } from "@/lib/queue/bootstrap";
import { getQueue } from "@/lib/queue/queueProvider";
import type { NotificationPayload } from "@/lib/notifications/dispatcher";

export type ScrapeJobPayload = {
  query: string;
  location?: string;
  boards?: string[];
  maxResults?: number;
  userId?: string;
  context?: {
    proxyRotationSecret?: string;
    captchaApiKey?: string;
  };
};

export type ApplicationJobPayload = {
  applicationId: string;
};

export const enqueueScrapeJob = async (
  payload: ScrapeJobPayload,
  options?: JobsOptions
) => {
  await initializeQueues();
  const { queue } = getQueue("scraping");

  return queue.add(
    `scrape:${payload.query}:${payload.location ?? "global"}`,
    payload,
    {
      removeOnComplete: 200,
      ...options,
    }
  );
};

export const enqueueApplicationSubmission = async (
  payload: ApplicationJobPayload,
  options?: JobsOptions
) => {
  await initializeQueues();
  const { queue } = getQueue("applications");

  return queue.add(
    `application:${payload.applicationId}`,
    payload,
    {
      removeOnComplete: 200,
      ...options,
    }
  );
};

export const enqueueNotification = async (
  payload: NotificationPayload,
  options?: JobsOptions
) => {
  await initializeQueues();
  const { queue } = getQueue("notifications");

  return queue.add(`notification:${Date.now()}`, payload, {
    removeOnComplete: 500,
    ...options,
  });
};
