import "dotenv/config";
import { IngestArticle, SyncArticles } from "@/application/article";
import { MatchArticleToStories } from "@/application/story";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { WorldNewsApiAdapter } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";

async function main() {
  const sourceRepository = new PrismaSourceRepository();
  const articleRepository = new PrismaArticleRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const assignmentRepository = new PrismaCategoryAssignmentRepository();
  const storyRepository = new PrismaStoryRepository();
  const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
  const articlesFetcher = new WorldNewsApiAdapter();
  const embedder = new TransformersEmbedder();

  const categoryClassifier = process.env.GROQ_API_KEY
    ? new GroqClassifier(process.env.GROQ_API_KEY, categoryRepository)
    : { async classify(): Promise<string[]> { return []; } };

  const matchArticleToStories = new MatchArticleToStories(
    storyRepository,
    articleEmbeddingRepository,
    embedder,
  );

  const ingestArticle = new IngestArticle(
    articleRepository,
    assignmentRepository,
    categoryClassifier,
    matchArticleToStories,
  );

  const syncArticles = new SyncArticles(
    sourceRepository,
    articlesFetcher,
    ingestArticle,
  );

  console.log("Starting sync...");
  const result = await syncArticles.execute();
  console.log(`Synced ${result.synced} articles.`);
  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    for (const err of result.errors) console.log(`  - ${err}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
