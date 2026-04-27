import { prisma } from "@/infrastructure/db/prisma/client";
import {
  BackfillArticles,
  HealArticles,
  IngestArticle,
  SyncArticles,
} from "@/application/article";
import { MatchArticleToStories } from "@/application/story";
import {
  AnalyzeArticleSentiment,
  AnalyzeSentimentBatch,
  ClusterArticle,
} from "@/application/news-event";
import { SendNotifications } from "@/application/notification";
import { PrismaSourceRepository } from "@/infrastructure/db/prisma/source-repository-impl";
import { PrismaArticleRepository } from "@/infrastructure/db/prisma/article-repository-impl";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { PrismaNewsEventRepository } from "@/infrastructure/db/prisma/news-event-repository-impl";
import { PrismaUserRepository } from "@/infrastructure/db/prisma/user-repository-impl";
import { PrismaNotificationRepository } from "@/infrastructure/db/prisma/notification-repository-impl";
import { WorldNewsApiAdapter } from "@/infrastructure/news/worldnewsapi/worldnewsapi-adapter";
import { RssArticleFetcher } from "@/infrastructure/news/rss/rss-adapter";
import { MultiSourceArticleFetcher } from "@/infrastructure/news/multi-source-fetcher";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { GroqSentimentAnalyzer } from "@/infrastructure/ai/groq-sentiment-analyzer";
import { GroqTranslationService } from "@/infrastructure/ai/groq-translator";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";
import { ResendEmailAdapter } from "@/infrastructure/mail/resend/resend-email-adapter";
import { PrismaArticleTranslationRepository } from "@/infrastructure/db/prisma/article-translation-repository-impl";
import { PrismaArticleTitleSource } from "@/infrastructure/db/prisma/article-title-source-impl";
import { PrefetchArticleTitles } from "@/application/article-translation";
import type { TranslationService } from "@/domain/article-translation";

export interface Container {
  syncArticles: SyncArticles;
  healArticles: HealArticles;
  backfillArticles: BackfillArticles;
  sendNotifications: SendNotifications;
  runNotificationsAllUsers: () => Promise<{ processed: number; results: Array<{ userId: string; status: string }> }>;
  prefetchArticleTitles: PrefetchArticleTitles | null;
  prisma: typeof prisma;
}

export function buildContainer(): Container {
  const sourceRepository = new PrismaSourceRepository();
  const articleRepository = new PrismaArticleRepository();
  const categoryRepository = new PrismaCategoryRepository();
  const assignmentRepository = new PrismaCategoryAssignmentRepository();
  const storyRepository = new PrismaStoryRepository();
  const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
  const newsEventRepository = new PrismaNewsEventRepository();
  const userRepository = new PrismaUserRepository();
  const notificationRepository = new PrismaNotificationRepository();

  const articlesFetcher = new MultiSourceArticleFetcher(
    new WorldNewsApiAdapter(),
    new RssArticleFetcher(),
  );
  const embedder = new TransformersEmbedder();
  const sentimentAnalyzer = new GroqSentimentAnalyzer(process.env.GROQ_API_KEY ?? "");
  const emailSender = new ResendEmailAdapter(process.env.RESEND_API_KEY ?? "");

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

  const ingestArticle = new IngestArticle(
    articleRepository,
    assignmentRepository,
    categoryClassifier,
    matchArticleToStories,
    clusterArticle,
    analyzeArticleSentiment,
  );

  const syncArticles = new SyncArticles(
    sourceRepository,
    articlesFetcher,
    ingestArticle,
  );

  const healArticles = new HealArticles(
    categoryClassifier,
    assignmentRepository,
    clusterArticle,
    analyzeSentimentBatch,
  );

  const backfillArticles = new BackfillArticles(
    sourceRepository,
    articlesFetcher,
    ingestArticle,
  );

  const sendNotifications = new SendNotifications(
    userRepository,
    categoryRepository,
    articleRepository,
    notificationRepository,
    emailSender,
  );

  async function runNotificationsAllUsers() {
    const users = await prisma.user.findMany({ select: { id: true } });
    const results: Array<{ userId: string; status: string }> = [];

    for (const user of users) {
      try {
        await sendNotifications.execute(user.id);
        results.push({ userId: user.id, status: "ok" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed";
        results.push({ userId: user.id, status: message });
      }
    }

    return { processed: results.length, results };
  }

  const translator: TranslationService | null = process.env.GROQ_API_KEY
    ? new GroqTranslationService(process.env.GROQ_API_KEY)
    : null;

  const articleTranslationRepository = new PrismaArticleTranslationRepository();
  const articleTitleSource = new PrismaArticleTitleSource();

  const prefetchArticleTitles = translator
    ? new PrefetchArticleTitles(articleTitleSource, articleTranslationRepository, translator)
    : null;

  return {
    syncArticles,
    healArticles,
    backfillArticles,
    sendNotifications,
    runNotificationsAllUsers,
    prefetchArticleTitles,
    prisma,
  };
}
