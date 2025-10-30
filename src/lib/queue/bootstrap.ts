import { setTimeout as delay } from "timers/promises";
import type { Job } from "bullmq";
import { ApplicationStatus } from "@prisma/client";
import { registerWorker, getQueue } from "@/lib/queue/queueProvider";
import { gatherJobs } from "@/lib/scraping/pipeline";
import { storeScrapedJobs, refreshJobsForUser } from "@/lib/jobs/jobService";
import type { ScrapeContext } from "@/lib/scraping/types";
import { getEnv } from "@/lib/config/env";
import { captureError } from "@/lib/observability/instrumentation";
import { prisma } from "@/lib/db/prisma";
import { updateApplicationStatus } from "@/lib/applications/service";
import { dispatchNotification } from "@/lib/notifications/dispatcher";
import type { NotificationPayload } from "@/lib/notifications/dispatcher";

const DEFAULT_SCRAPE_CONFIGS = [
  { query: "Software Engineer", location: "Remote" },
  { query: "Product Manager", location: "Remote" },
  { query: "Data Scientist", location: "New York, NY" },
  { query: "DevOps Engineer", location: "Austin, TX" },
];

const DEFAULT_BOARDS = ["linkedin", "indeed", "glassdoor"] as const;

const globalState = globalThis as typeof globalThis & {
  __queuesInitialized?: boolean;
};

const isRedisConfigured = () => {
  const env = getEnv();
  return Boolean(env.REDIS_URL);
};

const registerScrapingWorker = () => {
  registerWorker({
    name: "scraping",
    concurrency: 2,
    processor: async (job: Job<Record<string, unknown>>) => {
      const env = getEnv();
      const boards = (job.data.boards as string[] | undefined) ?? [...DEFAULT_BOARDS];
      const query = String(job.data.query ?? "");

      if (!query) {
        return { ingested: 0, errors: ["Missing query"] };
      }

      const location = job.data.location ? String(job.data.location) : undefined;
      const maxResults = job.data.maxResults ? Number(job.data.maxResults) : 40;

      const context: ScrapeContext = {
        proxyRotationSecret:
          (job.data.context as ScrapeContext | undefined)?.proxyRotationSecret ??
          env.SCRAPER_PROXY_ROTATION_SECRET ??
          undefined,
        captchaApiKey:
          (job.data.context as ScrapeContext | undefined)?.captchaApiKey ??
          env.CAPTCHA_API_KEY ??
          undefined,
      };

      try {
        const result = await gatherJobs(
          { query, location, maxResults },
          context,
          boards
        );

        const grouped = result.jobs.reduce<Record<string, typeof result.jobs>>((acc, item) => {
          const key = item.source.toLowerCase();
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});

        await Promise.all(
          Object.entries(grouped).map(([board, jobs]) => storeScrapedJobs(board, jobs))
        );

        if (job.data.userId) {
          await refreshJobsForUser(
            String(job.data.userId),
            query,
            location
          );
        }

        return {
          ingested: result.jobs.length,
          errors: result.errors,
        };
      } catch (error) {
        captureError(error);
        return {
          ingested: 0,
          errors: [
            error instanceof Error ? error.message : "Unknown scraping failure",
          ],
        };
      }
    },
  });
};

const registerApplicationWorker = () => {
  registerWorker({
    name: "applications",
    concurrency: 3,
    processor: async (job: Job<{ applicationId: string }>) => {
      const applicationId = job.data?.applicationId;

      if (!applicationId) {
        return { error: "Missing applicationId" };
      }

      try {
        const application = await prisma.jobApplication.findUnique({
          where: { id: applicationId },
          include: {
            user: {
              include: {
                notificationPreference: true,
              },
            },
            jobPosting: true,
          },
        });

        if (!application) {
          return { error: "Application not found" };
        }

        await updateApplicationStatus(
          application.userId,
          application.id,
          ApplicationStatus.SUBMISSION_IN_PROGRESS,
          { queueJobId: job.id }
        );

        await delay(1_500);

        await updateApplicationStatus(
          application.userId,
          application.id,
          ApplicationStatus.SUBMITTED,
          {
            queueJobId: job.id,
            automation: "auto-submit",
          }
        );

        return { status: "submitted" };
      } catch (error) {
        captureError(error);
        return {
          error: error instanceof Error ? error.message : "Failed to submit",
        };
      }
    },
  });
};

const registerNotificationWorker = () => {
  registerWorker({
    name: "notifications",
    concurrency: 5,
    processor: async (job: Job<NotificationPayload>) => {
      try {
        await dispatchNotification(job.data);
        return { delivered: true };
      } catch (error) {
        captureError(error);
        return {
          delivered: false,
          error: error instanceof Error ? error.message : "Unknown notification failure",
        };
      }
    },
  });
};

const scheduleScrapingJobs = async () => {
  const { queue } = getQueue("scraping");

  await Promise.all(
    DEFAULT_SCRAPE_CONFIGS.map(async (config) => {
      const jobId = `default:${config.query.toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${
        config.location?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "global"
      }`;

      await queue.add(
        "scheduled-scrape",
        {
          ...config,
          boards: [...DEFAULT_BOARDS],
          maxResults: 50,
        },
        {
          jobId,
          repeat: {
            every: 45 * 60 * 1000,
          },
          removeOnComplete: 50,
        }
      );
    })
  );
};

export const initializeQueues = async () => {
  if (globalState.__queuesInitialized) {
    return;
  }

  if (!isRedisConfigured()) {
    console.warn("Skipping queue initialization – REDIS_URL is not configured.");
    globalState.__queuesInitialized = true;
    return;
  }

  registerScrapingWorker();
  registerApplicationWorker();
  registerNotificationWorker();
  await scheduleScrapingJobs();

  globalState.__queuesInitialized = true;
};
