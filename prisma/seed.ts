import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
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

const demoRssSources: Array<{ name: string; baseUrl: string; language: "ES" | "EN" }> = [
  {
    name: "El País",
    baseUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
    language: "ES",
  },
  {
    name: "20 Minutos",
    baseUrl: "https://www.20minutos.es/rss/",
    language: "ES",
  },
  {
    name: "Google News (España)",
    baseUrl: "https://news.google.com/rss?hl=es&gl=ES&ceid=ES:es",
    language: "ES",
  },
  { name: "elDiario.es", baseUrl: "https://www.eldiario.es/rss/", language: "ES" },
  {
    name: "El Mundo",
    baseUrl: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml",
    language: "ES",
  },
  { name: "ABC", baseUrl: "https://www.abc.es/rss/2.0/portada/", language: "ES" },
  {
    name: "La Vanguardia",
    baseUrl: "https://www.lavanguardia.com/rss/home.xml",
    language: "ES",
  },
  { name: "Europa Press", baseUrl: "https://www.europapress.es/rss/rss.aspx", language: "ES" },
  { name: "Xataka", baseUrl: "https://www.xataka.com/feedburner.xml", language: "ES" },
  {
    name: "El Confidencial",
    baseUrl: "https://rss.elconfidencial.com/espana/",
    language: "ES",
  },
  {
    name: "BBC News (RSS)",
    baseUrl: "https://feeds.bbci.co.uk/news/rss.xml",
    language: "EN",
  },
  {
    name: "The Guardian (World)",
    baseUrl: "https://www.theguardian.com/world/rss",
    language: "EN",
  },
  { name: "NPR News", baseUrl: "https://feeds.npr.org/1001/rss.xml", language: "EN" },
  { name: "Al Jazeera", baseUrl: "https://www.aljazeera.com/xml/rss/all.xml", language: "EN" },
  {
    name: "The New York Times",
    baseUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    language: "EN",
  },
  {
    name: "Google News (US)",
    baseUrl: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
    language: "EN",
  },
];

// Same rule as User.create in src/domain/user/user-entity.ts.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  for (const { name, baseUrl, language } of demoRssSources) {
    const exists = await prisma.source.findFirst({ where: { name } });
    if (exists) continue;
    await prisma.source.create({
      data: { name, baseUrl, apiKey: "", kind: "RSS", language, active: true },
    });
    createdSources++;
  }

  if (createdSources > 0) {
    console.log(`Seeded ${createdSources} demo RSS sources`);
  }

  await seedTestUser("TEST_USER", "USER");
  await seedTestUser("TEST_ADMIN", "ADMIN");
}

async function seedTestUser(envPrefix: string, role: "USER" | "ADMIN") {
  const email = process.env[`${envPrefix}_EMAIL`]?.trim();
  const password = process.env[`${envPrefix}_PASSWORD`];

  if (!email || !password) {
    console.log(`Skipping ${role} test user: ${envPrefix}_EMAIL or ${envPrefix}_PASSWORD not set`);
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    console.log(`Skipping ${role} test user: ${envPrefix}_EMAIL is not a valid email address`);
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (role === "ADMIN" && existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Promoted existing user ${email} to ADMIN`);
    } else {
      console.log(`${role} test user ${email} already exists (role ${existing.role})`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      language: "ES",
    },
  });
  console.log(`Created ${role} test user ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
