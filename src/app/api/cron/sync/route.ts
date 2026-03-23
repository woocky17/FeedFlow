import { NextRequest, NextResponse } from "next/server";
import { SyncArticles } from "@/application/article";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { NewsApiAdapter } from "@/infrastructure/news/newsapi/newsapi-adapter";

const sourceRepository = new PrismaSourceRepository();
const articleRepository = new PrismaArticleRepository();
const assignmentRepository = new PrismaCategoryAssignmentRepository();
const articlesFetcher = new NewsApiAdapter(process.env.NEWSAPI_KEY || "");

// Simple keyword-based classifier that maps to default category names
const categoryClassifier = {
  async classify(): Promise<string[]> {
    return [];
  },
};

const syncArticles = new SyncArticles(
  sourceRepository,
  articleRepository,
  articlesFetcher,
  assignmentRepository,
  categoryClassifier,
);

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
