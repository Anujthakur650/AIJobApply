import { Queue, QueueScheduler, Worker, type JobsOptions } from "bullmq";
import Redis from "ioredis";
import type { Job } from "bullmq";
import { getEnv } from "@/lib/config/env";

export type SupportedQueue =
  | "scraping"
  | "matching"
  | "applications"
  | "notifications"
  | "analytics";

type QueueBundle = {
  queue: Queue;
  scheduler: QueueScheduler;
};

type QueueHandlers = {
  name: SupportedQueue;
  concurrency?: number;
  processor: (job: Job) => Promise<unknown>;
};

const queueRegistry = new Map<SupportedQueue, QueueBundle>();
const workerRegistry = new Map<SupportedQueue, Worker>();

const { REDIS_URL } = getEnv();

let redisClient: Redis | null = null;

const ensureRedisConnection = () => {
  if (!REDIS_URL) {
    throw new Error(
      "Queue access attempted without REDIS_URL being configured."
    );
  }

  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
  }

  return redisClient;
};

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  removeOnComplete: { count: 1000 },
  removeOnFail: false,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
};

export const getQueue = (name: SupportedQueue): QueueBundle => {
  const existing = queueRegistry.get(name);

  if (existing) {
    return existing;
  }

  const connection = ensureRedisConnection();

  const queue = new Queue(name, {
    connection,
    defaultJobOptions,
  });

  const scheduler = new QueueScheduler(name, { connection });

  const bundle = { queue, scheduler };
  queueRegistry.set(name, bundle);

  return bundle;
};

export const registerWorker = ({
  name,
  processor,
  concurrency = 5,
}: QueueHandlers) => {
  if (workerRegistry.has(name)) {
    return workerRegistry.get(name);
  }

  const connection = ensureRedisConnection();

  const worker = new Worker(name, processor, {
    connection,
    concurrency,
  });

  worker.on("error", (error) => {
    console.error(`Worker error for ${name}:`, error);
  });

  workerRegistry.set(name, worker);
  return worker;
};
