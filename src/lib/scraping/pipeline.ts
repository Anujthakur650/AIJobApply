import { scrapeJobs } from "@/lib/scraping/scraperRegistry";
import type {
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
  ScrapedJob,
} from "@/lib/scraping/types";

const DEFAULT_BOARDS = ["linkedin", "indeed", "glassdoor"] as const;

const dedupeJobs = (jobs: ScrapedJob[]) => {
  const cache = new Map<string, ScrapedJob>();

  jobs.forEach((job) => {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}|${job.location?.toLowerCase() ?? "remote"}`;

    if (!cache.has(key)) {
      cache.set(key, job);
    }
  });

  return Array.from(cache.values());
};

export type AggregateScrapeResult = {
  jobs: ScrapedJob[];
  errors: string[];
};

export const gatherJobs = async (
  payload: Omit<ScrapePayload, "board">,
  context: ScrapeContext,
  boards = DEFAULT_BOARDS
): Promise<AggregateScrapeResult> => {
  const results = await Promise.all(
    boards.map(async (board) => {
      try {
        return await scrapeJobs({ ...payload, board }, context);
      } catch (error) {
        return {
          jobs: [],
          errors: [`Failed to scrape ${board}: ${(error as Error).message}`],
        } satisfies ScrapeResult;
      }
    })
  );

  return {
    jobs: dedupeJobs(results.flatMap((result) => result.jobs)),
    errors: results.flatMap((result) => result.errors),
  };
};
