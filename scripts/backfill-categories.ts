import "dotenv/config";
import { CategoryAssignment } from "@/domain/category";
import { PrismaCategoryRepository } from "@/infrastructure/db/prisma/category-repository-impl";
import { PrismaCategoryAssignmentRepository } from "@/infrastructure/db/prisma/category-assignment-repository-impl";
import { GroqClassifier } from "@/infrastructure/ai/groq-classifier";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    process.exit(1);
  }

  const categoryRepository = new PrismaCategoryRepository();
  const assignmentRepository = new PrismaCategoryAssignmentRepository();
  const classifier = new GroqClassifier(process.env.GROQ_API_KEY, categoryRepository);

  const articles = await prisma.article.findMany({
    where: { categoryAssignments: { none: {} } },
    select: { id: true, title: true, description: true },
  });

  console.log(`Found ${articles.length} articles without categories`);

  let classified = 0;
  let skipped = 0;

  for (const article of articles) {
    const categoryIds = await classifier.classify(
      article.title,
      article.description ?? "",
    );

    if (categoryIds.length === 0) {
      skipped++;
      continue;
    }

    for (const categoryId of categoryIds) {
      const assignment = CategoryAssignment.create({
        articleId: article.id,
        categoryId,
        userId: "",
        origin: "auto",
        assignedAt: new Date(),
      });
      try {
        await assignmentRepository.create(assignment);
      } catch {
        // ignore duplicate assignment errors
      }
    }
    classified++;
    console.log(`[${classified}/${articles.length}] ${article.title.slice(0, 70)}`);
  }

  console.log(`\nDone. Classified: ${classified}, Skipped (no match): ${skipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
