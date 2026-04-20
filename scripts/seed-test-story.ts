import "dotenv/config";
import bcrypt from "bcryptjs";
import { FollowArticle, BackfillStory } from "@/application/story";
import { PrismaStoryRepository } from "@/infrastructure/db/prisma/story-repository-impl";
import { PrismaArticleEmbeddingRepository } from "@/infrastructure/db/prisma/article-embedding-repository-impl";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";
import { GroqTopicGenerator } from "@/infrastructure/ai/groq-topic-generator";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  const testEmail = "test@feedflow.local";
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    const passwordHash = await bcrypt.hash("test1234", 10);
    user = await prisma.user.create({
      data: { email: testEmail, passwordHash, role: "USER" },
    });
    console.log(`Created test user: ${testEmail} / test1234`);
  } else {
    console.log(`Using existing test user: ${testEmail}`);
  }

  const seedArticleId = process.argv[2];
  const seedArticle = seedArticleId
    ? await prisma.article.findUnique({ where: { id: seedArticleId } })
    : await prisma.article.findFirst({ orderBy: { publishedAt: "desc" } });
  if (!seedArticle) {
    console.error("No articles available. Run sync first.");
    process.exit(1);
  }

  console.log(`\nSeed article: "${seedArticle.title}"`);

  await prisma.story.deleteMany({ where: { userId: user.id } });

  const storyRepository = new PrismaStoryRepository();
  const articleEmbeddingRepository = new PrismaArticleEmbeddingRepository();
  const embedder = new TransformersEmbedder();
  const topicGenerator = new GroqTopicGenerator(process.env.GROQ_API_KEY ?? "");

  const threshold = Number(process.env.STORY_SIMILARITY_THRESHOLD ?? 0.35);
  const backfillStory = new BackfillStory(
    storyRepository,
    articleEmbeddingRepository,
    embedder,
  );
  const followArticle = new FollowArticle(
    storyRepository,
    articleEmbeddingRepository,
    {
      async getById(id: string) {
        return prisma.article.findUnique({
          where: { id },
          select: { id: true, title: true, description: true },
        });
      },
    },
    embedder,
    topicGenerator,
    backfillStory,
    threshold,
  );

  console.log(`\nFollowing article (threshold ${threshold})...`);
  const story = await followArticle.execute({
    userId: user.id,
    articleId: seedArticle.id,
  });

  const count = await prisma.storyArticle.count({ where: { storyId: story.id } });
  console.log(`\nStory created: "${story.name}"`);
  console.log(`Summary: ${story.summary}`);
  console.log(`Articles in timeline: ${count}`);

  const members = await prisma.storyArticle.findMany({
    where: { storyId: story.id },
    orderBy: { similarity: "desc" },
    include: { article: { select: { title: true, publishedAt: true } } },
  });
  console.log("\nTimeline:");
  for (const m of members) {
    console.log(`  [${(m.similarity * 100).toFixed(1)}%] ${m.article.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
