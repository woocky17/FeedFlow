import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EditSource, DeleteSource, ToggleSource } from "@/application/source";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";

const sourceRepository = new PrismaSourceRepository();
const editSource = new EditSource(sourceRepository);
const toggleSource = new ToggleSource(sourceRepository);
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
    const body = await request.json();

    // If only `active` is sent, use ToggleSource
    if ("active" in body && Object.keys(body).length === 1) {
      const source = await toggleSource.execute({
        sourceId: id,
        active: body.active,
      });
      return NextResponse.json(source);
    }

    const source = await editSource.execute({
      sourceId: id,
      name: body.name,
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      kind: body.kind === "rss" || body.kind === "worldnews" ? body.kind : undefined,
      language: body.language === "es" || body.language === "en" ? body.language : undefined,
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
