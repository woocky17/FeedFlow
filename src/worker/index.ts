import "dotenv/config";
import { buildContainer } from "./container";
import { log, startLoop } from "./loop";

async function main(): Promise<void> {
  log("info", { event: "boot", message: "worker starting" });

  const container = buildContainer();

  const handle = startLoop({
    jobs: [
      {
        name: "sync",
        intervalSec: Number(process.env.SYNC_INTERVAL_SECONDS ?? 7200),
        run: async () => {
          const sync = await container.syncArticles.execute();
          const heal = await container.healArticles.execute();
          return {
            synced: sync.synced,
            errors: sync.errors.length,
            heal,
          };
        },
      },
      {
        name: "notifications",
        intervalSec: Number(process.env.NOTIFICATIONS_INTERVAL_SECONDS ?? 86400),
        run: async () => {
          const result = await container.runNotificationsAllUsers();
          return { processed: result.processed };
        },
      },
    ],
  });

  let shuttingDown = false;
  for (const sig of ["SIGTERM", "SIGINT"] as const) {
    process.on(sig, async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      log("info", { event: "shutdown", signal: sig });
      await handle.stop();
      await container.prisma.$disconnect();
      log("info", { event: "exit" });
      process.exit(0);
    });
  }
}

main().catch((error) => {
  log("error", {
    event: "fatal",
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
