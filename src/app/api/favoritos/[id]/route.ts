import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeleteFavorite } from "@/application/favorite";
import { PrismaFavoriteRepository } from "@/infrastructure/db/prisma/favorite-repository-impl";

const favoriteRepository = new PrismaFavoriteRepository();
const deleteFavorite = new DeleteFavorite(favoriteRepository);

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await deleteFavorite.execute({
      favoriteId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Favorite deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete favorite";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
