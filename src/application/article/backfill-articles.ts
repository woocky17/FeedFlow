import { ArticleFetcher } from "@/domain/article";
import { Source, SourceRepository } from "@/domain/source";
import { IngestArticle } from "./ingest-article";

export interface BackfillInput {
  daysBack: number;
  sourceIds?: string[];
  windowHours?: number;
  perWindowLimit?: number;
}

export interface BackfillResult {
  fetched: number;
  ingested: number;
  errors: string[];
}

const DEFAULT_WINDOW_HOURS = 24;
const DEFAULT_PER_WINDOW_LIMIT = 100;

export class BackfillArticles {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly articlesFetcher: ArticleFetcher,
    private readonly ingestArticle: IngestArticle,
  ) {}

  async execute(input: BackfillInput): Promise<BackfillResult> {
    const { daysBack } = input;
    const windowHours = input.windowHours ?? DEFAULT_WINDOW_HOURS;
    const perWindowLimit = input.perWindowLimit ?? DEFAULT_PER_WINDOW_LIMIT;

    const result: BackfillResult = { fetched: 0, ingested: 0, errors: [] };

    if (daysBack <= 0) {
      result.errors.push("daysBack must be > 0");
      return result;
    }

    const sources = await this.resolveSources(input.sourceIds);
    if (sources.length === 0) {
      result.errors.push("No active sources to backfill");
      return result;
    }

    const windows = this.buildWindows(daysBack, windowHours);
    let quotaExhausted = false;

    for (const source of sources) {
      if (quotaExhausted) {
        result.errors.push(`Skipped ${source.name}: quota exhausted`);
        continue;
      }

      for (const { from, to } of windows) {
        try {
          const articles = await this.articlesFetcher.fetchBySource(source, {
            from,
            to,
            limit: perWindowLimit,
          });
          result.fetched += articles.length;

          for (const article of articles) {
            const ingest = await this.ingestArticle.execute(article);
            if (ingest.ingested) result.ingested++;
            result.errors.push(...ingest.errors);
          }
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            (error as { name?: string }).name === "QuotaExhaustedError"
          ) {
            quotaExhausted = true;
            result.errors.push(
              `Quota exhausted at ${source.name} window ${from.toISOString()}..${to.toISOString()}`,
            );
            break;
          }
          result.errors.push(
            `Fetch failed for ${source.name} window ${from.toISOString()}..${to.toISOString()}: ${error}`,
          );
        }
      }
    }

    return result;
  }

  private async resolveSources(sourceIds?: string[]): Promise<Source[]> {
    const active = await this.sourceRepository.findActive();
    if (!sourceIds || sourceIds.length === 0) return active;
    const set = new Set(sourceIds);
    return active.filter((s) => set.has(s.id));
  }

  private buildWindows(daysBack: number, windowHours: number): Array<{ from: Date; to: Date }> {
    const now = new Date();
    const windowMs = windowHours * 60 * 60 * 1000;
    const totalMs = daysBack * 24 * 60 * 60 * 1000;
    const start = new Date(now.getTime() - totalMs);

    const windows: Array<{ from: Date; to: Date }> = [];
    let cursor = start.getTime();
    while (cursor < now.getTime()) {
      const to = Math.min(cursor + windowMs, now.getTime());
      windows.push({ from: new Date(cursor), to: new Date(to) });
      cursor = to;
    }
    return windows;
  }
}
