import { NextRequest, NextResponse } from "next/server";
import { ReadArticles } from "@/application/article";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";

const articleRepository = new PrismaArticleRepository();
const readArticles = new ReadArticles(articleRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const sourceId = searchParams.get("sourceId") ?? undefined;

    const articles = await readArticles.execute({ categoryId, sourceId });

    return NextResponse.json(articles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
