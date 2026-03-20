import { NextRequest, NextResponse } from "next/server";
import { AddSource } from "@/application/source";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { randomUUID } from "crypto";

const sourceRepository = new PrismaSourceRepository();
const addSource = new AddSource(sourceRepository);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, baseUrl } = body;

    if (!name || !baseUrl) {
      return NextResponse.json({ error: "name and baseUrl are required" }, { status: 400 });
    }

    const source = await addSource.execute({
      id: randomUUID(),
      name,
      baseUrl,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
