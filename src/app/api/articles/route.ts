import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const sourceId = searchParams.get("sourceId") ?? undefined;

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
    const collapsed: typeof rows[number] extends infer R
      ? Array<R & { eventMemberCount: number }>
      : never = [] as never;

    for (const row of rows) {
      const memberCount = row.newsEventId ? countByEvent.get(row.newsEventId) ?? 1 : 1;
      if (row.newsEventId && memberCount > 1) {
        if (seenEvents.has(row.newsEventId)) continue;
        seenEvents.add(row.newsEventId);
      }
      collapsed.push({ ...row, eventMemberCount: memberCount });
    }

    return NextResponse.json(collapsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
