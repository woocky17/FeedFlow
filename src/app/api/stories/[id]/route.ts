import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GetStoryTimeline, UnfollowStory } from "@/application/story";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";

export const runtime = "nodejs";

const storyRepository = new PrismaStoryRepository();
const getStoryTimeline = new GetStoryTimeline(storyRepository);
const unfollowStory = new UnfollowStory(storyRepository);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const timeline = await getStoryTimeline.execute({
      storyId: id,
      userId: session.user.id,
    });

    return NextResponse.json({
      story: {
        id: timeline.story.id,
        name: timeline.story.name,
        summary: timeline.story.summary,
        threshold: timeline.story.threshold,
        sourceArticleId: timeline.story.sourceArticleId,
        createdAt: timeline.story.createdAt,
      },
      articles: timeline.articles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Story not found" ? 404 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await unfollowStory.execute({ storyId: id, userId: session.user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Story not found" ? 404 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
