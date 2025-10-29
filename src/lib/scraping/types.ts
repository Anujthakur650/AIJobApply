import { z } from "zod";

enum ScrapeStrategy {
  Browser = "browser",
  Api = "api",
  Hybrid = "hybrid",
}

export const scrapedJobSchema = z.object({
  source: z.string(),
  externalId: z.string().optional(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  salary: z.string().nullable(),
  description: z.string(),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  applicationUrl: z.string().url(),
  applicationMethod: z.string().optional(),
  postedAt: z.string().datetime().nullable(),
  metadata: z.record(z.any()).optional(),
});

export type ScrapedJob = z.infer<typeof scrapedJobSchema> & {
  strategy: ScrapeStrategy;
};

export type ScrapeContext = {
  proxyRotationSecret?: string;
  captchaApiKey?: string;
};

export type ScrapeResult = {
  jobs: ScrapedJob[];
  nextCursor?: string;
  errors: string[];
};

export type ScrapePayload = {
  board: string;
  query: string;
  location?: string;
  cursor?: string;
  maxResults?: number;
};

export interface JobBoardScraper {
  readonly name: string;
  canHandle(board: string): boolean;
  scrape(payload: ScrapePayload, context: ScrapeContext): Promise<ScrapeResult>;
}

export { ScrapeStrategy };
