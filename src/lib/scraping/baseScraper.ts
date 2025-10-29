import { chromium, type Browser, type Page } from "playwright-core";
import { randomUUID } from "crypto";
import { setTimeout as delay } from "timers/promises";
import { getEnv } from "@/lib/config/env";
import {
  ScrapeStrategy,
  type ScrapeContext,
  type ScrapePayload,
  type ScrapeResult,
  scrapedJobSchema,
} from "@/lib/scraping/types";

const humanDelays = Array.from({ length: 6 }, (_, index) => (index + 2) * 1000);

abstract class BaseScraper {
  protected abstract readonly supportedBoards: string[];
  readonly strategy: ScrapeStrategy = ScrapeStrategy.Browser;

  canHandle(board: string) {
    return this.supportedBoards.includes(board.toLowerCase());
  }

  protected async getBrowser(): Promise<Browser> {
    const { SCRAPER_PROXY_ROTATION_SECRET } = getEnv();

    const launchOptions = SCRAPER_PROXY_ROTATION_SECRET
      ? {
          args: [
            `--proxy-server=http://${SCRAPER_PROXY_ROTATION_SECRET}`,
            "--disable-blink-features=AutomationControlled",
          ],
        }
      : {
          args: ["--disable-blink-features=AutomationControlled"],
        };

    return chromium.launch({
      headless: true,
      ignoreDefaultArgs: ["--enable-automation"],
      ...launchOptions,
    });
  }

  protected getStealthHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };
  }

  protected async simulateHumanBehavior(page: Page) {
    const jitter = humanDelays[Math.floor(Math.random() * humanDelays.length)];
    await delay(jitter);
    await page.mouse.move(100 + Math.random() * 200, 100 + Math.random() * 150);
  }

  protected normalizeJob(raw: unknown) {
    const parsed = scrapedJobSchema.parse(raw);
    return {
      id: randomUUID(),
      ...parsed,
      strategy: this.strategy,
    };
  }

  abstract scrape(
    payload: ScrapePayload,
    context: ScrapeContext
  ): Promise<ScrapeResult>;
}

export default BaseScraper;
