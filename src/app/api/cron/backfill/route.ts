import { NextRequest, NextResponse } from "next/server";
import { buildContainer } from "@/worker/container";

const container = buildContainer();

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_DAYS_DEFAULT = 3;

interface BackfillBody {
  daysBack?: number;
  sourceIds?: string[];
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BackfillBody = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      body = (await request.json()) as BackfillBody;
    }
  } catch {
    body = {};
  }

  const maxDays = Number(process.env.BACKFILL_MAX_DAYS ?? MAX_DAYS_DEFAULT);
  const requested = Math.floor(Number(body.daysBack ?? maxDays));
  const daysBack = Math.max(1, Math.min(requested, maxDays));

  const sourceIds =
    Array.isArray(body.sourceIds) && body.sourceIds.length > 0
      ? body.sourceIds
      : undefined;

  try {
    const result = await container.backfillArticles.execute({ daysBack, sourceIds });
    return NextResponse.json({ daysBack, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backfill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
