import { NextRequest, NextResponse } from "next/server";
import { GetNewsEvent } from "@/application/news-event";
import { PrismaNewsEventRepository } from "@/infrastructure/db/prisma/news-event-repository-impl";

export const runtime = "nodejs";

const eventRepository = new PrismaNewsEventRepository();
const getNewsEvent = new GetNewsEvent(eventRepository);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const details = await getNewsEvent.execute({ eventId: id });
    return NextResponse.json({
      event: {
        id: details.event.id,
        title: details.event.title,
        firstSeenAt: details.event.firstSeenAt,
        lastSeenAt: details.event.lastSeenAt,
      },
      articles: details.articles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Event not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
