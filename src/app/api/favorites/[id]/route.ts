import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaFavoriteRepository } from "@/infrastructure/db/prisma/favorite-repository-impl";

const favoriteRepository = new PrismaFavoriteRepository();

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: articleId } = await params;

    await favoriteRepository.deleteByArticle(session.user.id, articleId);

    return NextResponse.json({ message: "Favorite deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete favorite";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
