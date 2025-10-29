import BaseScraper from "@/lib/scraping/baseScraper";
import type {
  ScrapeContext,
  ScrapePayload,
  ScrapeResult,
} from "@/lib/scraping/types";

class GlassdoorScraper extends BaseScraper {
  protected readonly supportedBoards = ["glassdoor", "glassdoor.com"];

  async scrape(payload: ScrapePayload, context: ScrapeContext): Promise<ScrapeResult> {
    if (!this.canHandle(payload.board)) {
      return { jobs: [], errors: [`GlassdoorScraper cannot handle ${payload.board}`] };
    }

    const roles = [
      {
        title: `Senior ${payload.query}`,
        company: "Catalyst Workforce",
        salary: "$130k - $155k",
      },
      {
        title: `${payload.query} Automation Engineer`,
        company: "Vertex AI",
        salary: "$115k - $140k",
      },
    ];

    const jobs = roles.map((role, index) =>
      this.normalizeJob({
        source: "Glassdoor",
        externalId: `${payload.query}-${payload.location ?? "global"}-gd-${index}`,
        title: role.title,
        company: role.company,
        location: payload.location ?? "Hybrid - San Francisco, CA",
        salary: role.salary,
        description:
          "Partner with product and data teams to orchestrate AI-assisted job discovery and automated application flows.",
        requirements: ["Node.js", "Playwright", "Prisma"],
        benefits: ["401k", "Wellness stipend"],
        applicationUrl: "https://glassdoor.com/apply",
        applicationMethod: "external",
        postedAt: new Date(Date.now() - index * 172_800_000).toISOString(),
        metadata: {
          reviewsRating: 4.6,
          context,
        },
      })
    );

    return {
      jobs,
      nextCursor: undefined,
      errors: [],
    };
  }
}

export const glassdoorScraper = new GlassdoorScraper();
