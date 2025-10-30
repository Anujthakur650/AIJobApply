import { NextResponse } from "next/server";
import { initializeQueues } from "@/lib/queue/bootstrap";
import { getQueue, type SupportedQueue } from "@/lib/queue/queueProvider";

const QUEUES: SupportedQueue[] = [
  "scraping",
  "applications",
  "notifications",
  "matching",
  "analytics",
];

export const GET = async () => {
  try {
    await initializeQueues();

    const details = await Promise.all(
      QUEUES.map(async (queueName) => {
        try {
          const { queue } = getQueue(queueName);
          const counts = await queue.getJobCounts();
          const metrics = await queue.getMetrics();

          return {
            queue: queueName,
            counts,
            metrics,
          };
        } catch (error) {
          return {
            queue: queueName,
            error: error instanceof Error ? error.message : "Unavailable",
          };
        }
      })
    );

    return NextResponse.json({ queues: details });
  } catch (error) {
    console.error("Failed to read queue status", error);
    return NextResponse.json(
      { error: "Unable to read queue status" },
      { status: 500 }
    );
  }
};
