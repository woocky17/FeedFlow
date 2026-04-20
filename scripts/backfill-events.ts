import "dotenv/config";
import { ClusterArticle } from "@/application/news-event";
import { PrismaNewsEventRepository } from "@/infrastructure/db/prisma/news-event-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  const eventRepository = new PrismaNewsEventRepository();
  const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
  const embedder = new TransformersEmbedder();

  const threshold = Number(process.env.NEWS_EVENT_SIMILARITY_THRESHOLD ?? 0.72);
  const clusterArticle = new ClusterArticle(
    eventRepository,
    articleEmbeddingRepository,
    embedder,
    threshold,
  );

  const articles = await prisma.article.findMany({
    where: { newsEventId: null },
    orderBy: { publishedAt: "asc" },
    select: { id: true, title: true, description: true },
  });

  console.log(`Backfilling ${articles.length} articles at threshold ${threshold}...`);

  let eventsCreated = 0;
  let clusteredIntoExisting = 0;

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const result = await clusterArticle.execute({
      articleId: a.id,
      title: a.title,
      description: a.description,
    });
    if (result.created) eventsCreated++;
    else clusteredIntoExisting++;
    console.log(`  [${i + 1}/${articles.length}] ${result.created ? "NEW" : "JOIN"} ${result.eventId.slice(0, 8)} :: ${a.title.slice(0, 60)}`);
  }

  console.log(`\nDone. Events created: ${eventsCreated}, articles joined to existing: ${clusteredIntoExisting}`);

  const multiMember = await prisma.newsEvent.findMany({
    where: { articles: { some: {} } },
    include: { _count: { select: { articles: true } } },
  });
  const clusters = multiMember.filter((e) => e._count.articles > 1);
  console.log(`\nClusters with 2+ sources: ${clusters.length}`);
  for (const c of clusters) {
    console.log(`  [${c._count.articles}] ${c.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
