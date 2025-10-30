import { scrapeJobs } from "@/lib/scraping/scraperRegistry";
import type {
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
  ScrapedJob,
} from "@/lib/scraping/types";

const DEFAULT_BOARDS = ["linkedin", "indeed", "glassdoor"] as const;

const normalize = (value: string | null | undefined) =>
  value?.toLowerCase().replace(/\s+/g, " ").trim() ?? "";

const dedupeJobs = (jobs: ScrapedJob[]) => {
  const cache = new Map<string, ScrapedJob>();

  jobs.forEach((job) => {
    const key = `${normalize(job.company)}|${normalize(job.title)}|${normalize(job.location)}|${normalize(job.applicationUrl)}`;
    const existing = cache.get(key);

    if (!existing) {
      cache.set(key, job);
      return;
    }

    const existingHasSalary = Boolean(existing.salary);
    const candidateHasSalary = Boolean(job.salary);

    if (!existingHasSalary && candidateHasSalary) {
      cache.set(key, job);
      return;
    }

    if (candidateHasSalary && existingHasSalary) {
      const candidateLength = job.description.length;
      const existingLength = existing.description.length;
      if (candidateLength > existingLength) {
        cache.set(key, job);
      }
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
