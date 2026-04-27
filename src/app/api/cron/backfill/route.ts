import { NextRequest, NextResponse } from "next/server";
import { BackfillArticles, IngestArticle } from "@/application/article";
import { MatchArticleToStories } from "@/application/story";
import {
  AnalyzeArticleSentiment,
  ClusterArticle,
} from "@/application/news-event";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { PrismaNewsEventRepository } from "@/infrastructure/db/prisma/news-event-repository-impl";
import { WorldNewsApiAdapter } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";
import { RssArticleFetcher } from "@/infrastructure/news/rss/rss-adapter";
import { MultiSourceArticleFetcher } from "@/infrastructure/news/multi-source-fetcher";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { GroqSentimentAnalyzer } from "@/infrastructure/ai/groq-sentiment-analyzer";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";

const sourceRepository = new PrismaSourceRepository();
const articleRepository = new PrismaArticleRepository();
const categoryRepository = new PrismaCategoryRepository();
const assignmentRepository = new PrismaCategoryAssignmentRepository();
const storyRepository = new PrismaStoryRepository();
const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
const newsEventRepository = new PrismaNewsEventRepository();
const articlesFetcher = new MultiSourceArticleFetcher(
  new WorldNewsApiAdapter(),
  new RssArticleFetcher(),
);
const embedder = new TransformersEmbedder();
const sentimentAnalyzer = new GroqSentimentAnalyzer(process.env.GROQ_API_KEY ?? "");

const categoryClassifier = process.env.GROQ_API_KEY
  ? new GroqClassifier(process.env.GROQ_API_KEY, categoryRepository)
  : { async classify(): Promise<string[]> { return []; } };

const matchArticleToStories = new MatchArticleToStories(
  storyRepository,
  articleEmbeddingRepository,
  embedder,
);

const clusterArticle = new ClusterArticle(
  newsEventRepository,
  articleEmbeddingRepository,
  embedder,
  Number(process.env.NEWS_EVENT_SIMILARITY_THRESHOLD ?? 0.72),
);

const analyzeArticleSentiment = new AnalyzeArticleSentiment(sentimentAnalyzer);

const ingestArticle = new IngestArticle(
  articleRepository,
  assignmentRepository,
  categoryClassifier,
  matchArticleToStories,
  clusterArticle,
  analyzeArticleSentiment,
);

const backfillArticles = new BackfillArticles(
  sourceRepository,
  articlesFetcher,
  ingestArticle,
);

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_DAYS_DEFAULT = 3;

interface BackfillBody {
  daysBack?: number;
  sourceIds?: string[];
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BackfillBody = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      body = (await request.json()) as BackfillBody;
    }
  } catch {
    body = {};
  }

  const maxDays = Number(process.env.BACKFILL_MAX_DAYS ?? MAX_DAYS_DEFAULT);
  const requested = Math.floor(Number(body.daysBack ?? maxDays));
  const daysBack = Math.max(1, Math.min(requested, maxDays));

  const sourceIds =
    Array.isArray(body.sourceIds) && body.sourceIds.length > 0
      ? body.sourceIds
      : undefined;

  try {
    const result = await backfillArticles.execute({ daysBack, sourceIds });
    return NextResponse.json({ daysBack, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backfill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
