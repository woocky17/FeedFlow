import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const defaultCategories = [
  "Technology",
  "Science",
  "Business",
  "Sports",
  "Entertainment",
  "Health",
  "Politics",
  "World",
];

async function main() {
  for (const name of defaultCategories) {
    const exists = await prisma.category.findFirst({
      where: { name, type: "DEFAULT", userId: null },
    });

    if (!exists) {
      await prisma.category.create({
        data: { name, type: "DEFAULT", userId: null },
      });
    }
  }

  console.log(`Seeded ${defaultCategories.length} default categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
