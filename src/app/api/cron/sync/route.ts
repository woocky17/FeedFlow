import { NextRequest, NextResponse } from "next/server";
import { SyncArticles } from "@/application/article";
import { MatchArticleToStories } from "@/application/story";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { WorldNewsApiAdapter } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";

const sourceRepository = new PrismaSourceRepository();
const articleRepository = new PrismaArticleRepository();
const categoryRepository = new PrismaCategoryRepository();
const assignmentRepository = new PrismaCategoryAssignmentRepository();
const storyRepository = new PrismaStoryRepository();
const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
const articlesFetcher = new WorldNewsApiAdapter();
const embedder = new TransformersEmbedder();

const categoryClassifier = process.env.GROQ_API_KEY
  ? new GroqClassifier(process.env.GROQ_API_KEY, categoryRepository)
  : { async classify(): Promise<string[]> { return []; } };

const matchArticleToStories = new MatchArticleToStories(
  storyRepository,
  articleEmbeddingRepository,
  embedder,
);

const syncArticles = new SyncArticles(
  sourceRepository,
  articleRepository,
  articlesFetcher,
  assignmentRepository,
  categoryClassifier,
  matchArticleToStories,
);

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncArticles.execute();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
