import { prisma } from "./client";

const DEFAULT_CATEGORIES = [
  "Politics",
  "Sports",
  "Technology",
  "Economy",
  "Entertainment",
  "Science",
  "Health",
  "World",
];

async function main() {
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_userId: { name, userId: null as unknown as string } },
      update: {},
      create: {
        name,
        type: "DEFAULT",
        userId: null,
      },
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
