import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EditCustomCategory, DeleteCustomCategory } from "@/application/category";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";

const categoryRepository = new PrismaCategoryRepository();
const editCustomCategory = new EditCustomCategory(categoryRepository);
const deleteCustomCategory = new DeleteCustomCategory(categoryRepository);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const category = await editCustomCategory.execute({
      categoryId: id,
      userId: session.user.id,
      name,
    });

    return NextResponse.json(category);
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await deleteCustomCategory.execute({
      categoryId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
