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

const demoRssSources = [
  {
    name: "El País",
    baseUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
  },
  {
    name: "20 Minutos",
    baseUrl: "https://www.20minutos.es/rss/",
  },
  {
    name: "Google News (España)",
    baseUrl: "https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es",
  },
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

  let createdSources = 0;
  for (const { name, baseUrl } of demoRssSources) {
    const exists = await prisma.source.findFirst({ where: { name } });
    if (exists) continue;
    await prisma.source.create({
      data: { name, baseUrl, apiKey: "", kind: "RSS", active: true },
    });
    createdSources++;
  }

  if (createdSources > 0) {
    console.log(`Seeded ${createdSources} demo RSS sources`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
