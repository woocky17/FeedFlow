import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AddFavorite, GetFavorites } from "@/application/favorite";
import { PrismaFavoriteRepository } from "@/infrastructure/db/prisma/favorite-repository-impl";
import { randomUUID } from "crypto";

const favoriteRepository = new PrismaFavoriteRepository();
const addFavorite = new AddFavorite(favoriteRepository);
const getFavorites = new GetFavorites(favoriteRepository);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await getFavorites.execute({ userId: session.user.id });

    return NextResponse.json(favorites);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch favorites";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const favorite = await addFavorite.execute({
      id: randomUUID(),
      userId: session.user.id,
      articleId,
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add favorite";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
