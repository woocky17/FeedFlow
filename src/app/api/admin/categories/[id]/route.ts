import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { Category } from "@/domain/category";

const categoryRepository = new PrismaCategoryRepository();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const existing = await categoryRepository.findById(id);
    if (!existing || existing.type !== "default") {
      return NextResponse.json({ error: "Default category not found" }, { status: 404 });
    }

    const updated = Category.create({
      id: existing.id,
      name: name.trim(),
      type: "default",
      userId: null,
      createdAt: existing.createdAt,
    });

    await categoryRepository.update(updated);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await categoryRepository.findById(id);
    if (!existing || existing.type !== "default") {
      return NextResponse.json({ error: "Default category not found" }, { status: 404 });
    }

    await categoryRepository.delete(id);

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
