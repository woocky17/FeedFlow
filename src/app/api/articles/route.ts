import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/prisma/client";
import { auth } from "@/lib/auth";
import { fromPrismaLanguage, toPrismaLanguage } from "@/infrastructure/db/prisma/language-mapper";
import { isLanguage, type Language } from "@/domain/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const sourceId = searchParams.get("sourceId") ?? undefined;

    const session = await auth();
    const userLanguage: Language = isLanguage(session?.user?.language)
      ? session.user.language
      : "es";

    const where: Record<string, unknown> = {};
    if (categoryId) {
      where.categoryAssignments = { some: { categoryId } };
    }
    if (sourceId) {
      where.sourceId = sourceId;
    }

    const rows = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        image: true,
        sourceId: true,
        language: true,
        publishedAt: true,
        newsEventId: true,
        sentiment: true,
        framingSummary: true,
      },
    });

    const eventIds = Array.from(
      new Set(rows.map((r) => r.newsEventId).filter((id): id is string => !!id)),
    );
    const counts = eventIds.length
      ? await prisma.article.groupBy({
          by: ["newsEventId"],
          where: { newsEventId: { in: eventIds } },
          _count: { newsEventId: true },
        })
      : [];
    const countByEvent = new Map(
      counts.map((c) => [c.newsEventId, c._count.newsEventId]),
    );

    const seenEvents = new Set<string>();
    const visibleRows: typeof rows = [];
    for (const row of rows) {
      const memberCount = row.newsEventId ? countByEvent.get(row.newsEventId) ?? 1 : 1;
      if (row.newsEventId && memberCount > 1) {
        if (seenEvents.has(row.newsEventId)) continue;
        seenEvents.add(row.newsEventId);
      }
      visibleRows.push(row);
    }

    const idsToTranslate = visibleRows
      .filter((r) => fromPrismaLanguage(r.language) !== userLanguage)
      .map((r) => r.id);

    const translations = idsToTranslate.length
      ? await prisma.articleTranslation.findMany({
          where: {
            articleId: { in: idsToTranslate },
            targetLang: toPrismaLanguage(userLanguage),
          },
          select: { articleId: true, title: true, description: true },
        })
      : [];
    const translationByArticle = new Map(translations.map((t) => [t.articleId, t]));

    const collapsed = visibleRows.map((row) => {
      const memberCount = row.newsEventId ? countByEvent.get(row.newsEventId) ?? 1 : 1;
      const original = { title: row.title, description: row.description };
      const articleLanguage = fromPrismaLanguage(row.language);
      const translation = translationByArticle.get(row.id);

      const displayed = translation
        ? {
            title: translation.title,
            description: translation.description ?? row.description,
          }
        : original;

      return {
        id: row.id,
        title: displayed.title,
        description: displayed.description,
        url: row.url,
        image: row.image,
        sourceId: row.sourceId,
        publishedAt: row.publishedAt,
        newsEventId: row.newsEventId,
        sentiment: row.sentiment,
        framingSummary: row.framingSummary,
        language: articleLanguage,
        original: {
          title: row.title,
          description: row.description,
        },
        translation: translation
          ? {
              title: translation.title,
              description: translation.description,
            }
          : null,
        displayedLanguage: translation ? userLanguage : articleLanguage,
        isTranslated: Boolean(translation),
        eventMemberCount: memberCount,
      };
    });

    return NextResponse.json(collapsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
