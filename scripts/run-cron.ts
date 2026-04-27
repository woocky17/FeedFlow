import "dotenv/config";
import { buildContainer } from "@/worker/container";

async function main() {
  const c = buildContainer();

  console.log("[sync] starting...");
  const syncResult = await c.syncArticles.execute();
  console.log(`[sync] synced=${syncResult.synced} errors=${syncResult.errors.length}`);
  for (const err of syncResult.errors.slice(0, 10)) console.log(`  - ${err}`);

  console.log("[heal] starting...");
  const healResult = await c.healArticles.execute();
  console.log(`[heal] ${JSON.stringify(healResult)}`);

  await c.prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
