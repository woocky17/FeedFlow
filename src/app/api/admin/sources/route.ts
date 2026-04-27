import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AddSource } from "@/application/source";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { randomUUID } from "crypto";

const sourceRepository = new PrismaSourceRepository();
const addSource = new AddSource(sourceRepository);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sources = await sourceRepository.findAll();
    return NextResponse.json(sources);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch sources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, baseUrl, apiKey, kind, language } = await request.json();

    if (!name || !baseUrl) {
      return NextResponse.json({ error: "name and baseUrl are required" }, { status: 400 });
    }

    const resolvedKind = kind === "rss" ? "rss" : "worldnews";

    if (resolvedKind === "worldnews" && !apiKey) {
      return NextResponse.json({ error: "apiKey is required for WorldNewsAPI sources" }, { status: 400 });
    }

    const resolvedLanguage = language === "es" || language === "en" ? language : undefined;

    const source = await addSource.execute({
      id: randomUUID(),
      name,
      baseUrl,
      apiKey: apiKey ?? "",
      kind: resolvedKind,
      language: resolvedLanguage,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add source";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
