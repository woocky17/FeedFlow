import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EditSource, DeleteSource } from "@/application/source";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";

const sourceRepository = new PrismaSourceRepository();
const editSource = new EditSource(sourceRepository);
const deleteSource = new DeleteSource(sourceRepository);

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
    const { name, baseUrl } = await request.json();

    const source = await editSource.execute({
      sourceId: id,
      name,
      baseUrl,
    });

    return NextResponse.json(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update source";
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

    await deleteSource.execute({ sourceId: id });

    return NextResponse.json({ message: "Source deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete source";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
