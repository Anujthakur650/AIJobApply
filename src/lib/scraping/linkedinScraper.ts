import BaseScraper from "@/lib/scraping/baseScraper";
import type {
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
} from "@/lib/scraping/types";

class LinkedInScraper extends BaseScraper {
  protected readonly supportedBoards = ["linkedin", "linkedin.jobs"];

  async scrape(payload: ScrapePayload, context: ScrapeContext): Promise<ScrapeResult> {
    if (!this.canHandle(payload.board)) {
      return { jobs: [], errors: [`LinkedInScraper cannot handle ${payload.board}`] };
    }

    const jobs = [
      this.normalizeJob({
        source: "LinkedIn",
        externalId: `${payload.query}-${payload.location ?? "global"}`,
        title: `${payload.query} Specialist`,
        company: "Example Corp",
        location: payload.location ?? "Remote",
        salary: null,
        description: "Sample job description populated for orchestration testing.",
        requirements: ["TypeScript", "Automation"],
        benefits: ["Health", "Remote"],
        applicationUrl: "https://linkedin.com/jobs",
        applicationMethod: "direct",
        postedAt: new Date().toISOString(),
        metadata: { cursor: payload.cursor, context },
      }),
    ];

    return {
      jobs,
      nextCursor: undefined,
      errors: [],
    };
  }
}

export const linkedInScraper = new LinkedInScraper();
