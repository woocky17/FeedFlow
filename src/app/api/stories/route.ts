import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  BackfillStory,
  FollowArticle,
  ListUserStories,
} from "@/application/story";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";
import { GroqTopicGenerator } from "@/infrastructure/ai/groq-topic-generator";
import { prisma } from "@/infrastructure/db/prisma/client";

export const runtime = "nodejs";
export const maxDuration = 60;

const storyRepository = new PrismaStoryRepository();
const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
const embedder = new TransformersEmbedder();
const topicGenerator = new GroqTopicGenerator(process.env.GROQ_API_KEY ?? "");

const articleReader = {
  async getById(id: string) {
    const row = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, description: true },
    });
    return row;
  },
};

const threshold = Number(process.env.STORY_SIMILARITY_THRESHOLD ?? 0.55);
const backfillStory = new BackfillStory(
  storyRepository,
  articleEmbeddingRepository,
  embedder,
);
const followArticle = new FollowArticle(
  storyRepository,
  articleEmbeddingRepository,
  articleReader,
  embedder,
  topicGenerator,
  backfillStory,
  threshold,
);
const listUserStories = new ListUserStories(storyRepository);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stories = await listUserStories.execute({ userId: session.user.id });

  return NextResponse.json(
    stories.map((s) => ({
      id: s.story.id,
      name: s.story.name,
      summary: s.story.summary,
      sourceArticleId: s.story.sourceArticleId,
      threshold: s.story.threshold,
      active: s.story.active,
      createdAt: s.story.createdAt,
      articleCount: s.articleCount,
      latestArticleAt: s.latestArticleAt,
    })),
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let articleId: string;
  try {
    const body = await request.json();
    articleId = body?.articleId;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!articleId || typeof articleId !== "string") {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  try {
    const story = await followArticle.execute({
      userId: session.user.id,
      articleId,
    });
    return NextResponse.json(
      {
        id: story.id,
        name: story.name,
        summary: story.summary,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to follow story";
    const status = message === "Article not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
