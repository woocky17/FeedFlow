import "dotenv/config";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  const totals = await prisma.article.groupBy({
    by: ["sentiment"],
    _count: { _all: true },
  });
  console.log("Sentiment distribution:");
  for (const t of totals) {
    console.log(`  ${(t.sentiment ?? "null").padEnd(10)} ${t._count._all}`);
  }

  const clusters = await prisma.newsEvent.findMany({
    where: { articles: { some: {} } },
    include: {
      _count: { select: { articles: true } },
      articles: { select: { title: true, sentiment: true, framingSummary: true } },
    },
  });
  const multi = clusters.filter((c) => c._count.articles > 1);
  console.log(`\nMulti-source clusters: ${multi.length}`);
  for (const c of multi) {
    console.log(`\n  ${c.title} (${c._count.articles})`);
    for (const a of c.articles) {
      console.log(`    - [${a.sentiment ?? "null"}] ${a.title.slice(0, 80)}`);
      if (a.framingSummary) console.log(`      ${a.framingSummary}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
