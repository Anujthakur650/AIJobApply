import { linkedInScraper } from "@/lib/scraping/linkedinScraper";
import type {
  JobBoardScraper,
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
} from "@/lib/scraping/types";

const scrapers: JobBoardScraper[] = [linkedInScraper];

export const registerScraper = (scraper: JobBoardScraper) => {
  scrapers.push(scraper);
};

export const scrapeJobs = async (
  payload: ScrapePayload,
  context: ScrapeContext
): Promise<ScrapeResult> => {
  const scraper = scrapers.find((item) => item.canHandle(payload.board));

  if (!scraper) {
    return { jobs: [], errors: [`No scraper available for ${payload.board}`] };
  }

  return scraper.scrape(payload, context);
};
