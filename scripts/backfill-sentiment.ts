import "dotenv/config";
import { AnalyzeSentimentBatch } from "@/application/news-event";
import { GroqSentimentAnalyzer } from "@/infrastructure/ai/groq-sentiment-analyzer";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    process.exit(1);
  }

  const analyzer = new GroqSentimentAnalyzer(process.env.GROQ_API_KEY);
  const useCase = new AnalyzeSentimentBatch(analyzer);

  const articles = await prisma.article.findMany({
    where: { sentiment: null },
    select: { id: true, title: true, description: true },
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Analyzing sentiment for ${articles.length} articles in batches of 8...`);

  const result = await useCase.execute(
    articles.map((a) => ({ id: a.id, title: a.title, description: a.description ?? "" })),
  );

  console.log(`\nDone. Analyzed: ${result.analyzed}, Skipped: ${result.skipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
