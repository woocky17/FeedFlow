import "dotenv/config";
import { HealArticles, SyncArticles } from "@/application/article";
import { MatchArticleToStories } from "@/application/story";
import {
  AnalyzeArticleSentiment,
  AnalyzeSentimentBatch,
  ClusterArticle,
} from "@/application/news-event";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { PrismaNewsEventRepository } from "@/infrastructure/db/prisma/news-event-repository-impl";
import { WorldNewsApiAdapter } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { GroqSentimentAnalyzer } from "@/infrastructure/ai/groq-sentiment-analyzer";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";

async function main() {
  const sourceRepository = new PrismaSourceRepository();
  const articleRepository = new PrismaArticleRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const assignmentRepository = new PrismaCategoryAssignmentRepository();
  const storyRepository = new PrismaStoryRepository();
  const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
  const newsEventRepository = new PrismaNewsEventRepository();
  const articlesFetcher = new WorldNewsApiAdapter();
  const embedder = new TransformersEmbedder();
  const sentimentAnalyzer = new GroqSentimentAnalyzer(process.env.GROQ_API_KEY ?? "");

  const categoryClassifier = process.env.GROQ_API_KEY
    ? new GroqClassifier(process.env.GROQ_API_KEY, categoryRepository)
    : { async classify(): Promise<string[]> { return []; } };

  const matchArticleToStories = new MatchArticleToStories(
    storyRepository,
    articleEmbeddingRepository,
    embedder,
  );

  const clusterArticle = new ClusterArticle(
    newsEventRepository,
    articleEmbeddingRepository,
    embedder,
    Number(process.env.NEWS_EVENT_SIMILARITY_THRESHOLD ?? 0.72),
  );

  const analyzeArticleSentiment = new AnalyzeArticleSentiment(sentimentAnalyzer);
  const analyzeSentimentBatch = new AnalyzeSentimentBatch(sentimentAnalyzer);

  const syncArticles = new SyncArticles(
    sourceRepository,
    articleRepository,
    articlesFetcher,
    assignmentRepository,
    categoryClassifier,
    matchArticleToStories,
    clusterArticle,
    analyzeArticleSentiment,
  );

  const healArticles = new HealArticles(
    categoryClassifier,
    assignmentRepository,
    clusterArticle,
    analyzeSentimentBatch,
  );

  console.log("[sync] starting...");
  const syncResult = await syncArticles.execute();
  console.log(`[sync] synced=${syncResult.synced} errors=${syncResult.errors.length}`);
  for (const err of syncResult.errors.slice(0, 10)) console.log(`  - ${err}`);

  console.log("[heal] starting...");
  const healResult = await healArticles.execute();
  console.log(`[heal] ${JSON.stringify(healResult)}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
