import "dotenv/config";
import { buildContainer } from "@/worker/container";

async function main() {
  const c = buildContainer();

  console.log("Starting sync...");
  const result = await c.syncArticles.execute();
  console.log(`Synced ${result.synced} articles.`);
  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    for (const err of result.errors) console.log(`  - ${err}`);
  }

  await c.prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
