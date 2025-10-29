import BaseScraper from "@/lib/scraping/baseScraper";
import type {
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
} from "@/lib/scraping/types";

class IndeedScraper extends BaseScraper {
  protected readonly supportedBoards = ["indeed", "indeed.com"];

  async scrape(payload: ScrapePayload, context: ScrapeContext): Promise<ScrapeResult> {
    if (!this.canHandle(payload.board)) {
      return { jobs: [], errors: [`IndeedScraper cannot handle ${payload.board}`] };
    }

    const sample = Array.from({ length: 3 }).map((_, index) =>
      this.normalizeJob({
        source: "Indeed",
        externalId: `${payload.query}-${payload.location ?? "global"}-${index}`,
        title: `${payload.query} ${index === 0 ? "Lead" : "Specialist"}`,
        company: index === 0 ? "Nimbus Labs" : "Aurora Systems",
        location: payload.location ?? "Remote",
        salary: index === 0 ? "$120k - $150k" : "$100k - $130k",
        description:
          "Hands-on role building scalable automation for high-volume job campaigns across enterprise accounts.",
        requirements: ["React", "TypeScript", "Automation"],
        benefits: ["Equity", "Flexible PTO", "Remote friendly"],
        applicationUrl: "https://indeed.com/apply",
        applicationMethod: "direct",
        postedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
        metadata: {
          context,
          pagination: payload.cursor,
        },
      })
    );

    return {
      jobs: sample,
      nextCursor: undefined,
      errors: [],
    };
  }
}

export const indeedScraper = new IndeedScraper();
