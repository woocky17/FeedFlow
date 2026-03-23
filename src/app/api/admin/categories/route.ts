import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { Category } from "@/domain/category";
import { randomUUID } from "crypto";

const categoryRepository = new PrismaCategoryRepository();

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await categoryRepository.findDefault();
    return NextResponse.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const category = Category.create({
      id: randomUUID(),
      name: name.trim(),
      type: "default",
      userId: null,
      createdAt: new Date(),
    });

    await categoryRepository.create(category);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
