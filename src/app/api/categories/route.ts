import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CreateCustomCategory } from "@/application/category";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { randomUUID } from "crypto";

const categoryRepository = new PrismaCategoryRepository();
const createCustomCategory = new CreateCustomCategory(categoryRepository);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [defaultCategories, userCategories] = await Promise.all([
      categoryRepository.findDefault(),
      categoryRepository.findByUser(session.user.id),
    ]);

    return NextResponse.json([...defaultCategories, ...userCategories]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const category = await createCustomCategory.execute({
      id: randomUUID(),
      name,
      userId: session.user.id,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
