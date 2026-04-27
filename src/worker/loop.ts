export interface JobDefinition {
  name: string;
  intervalSec: number;
  run: () => Promise<unknown>;
}

export interface LoopOptions {
  jobs: JobDefinition[];
  jitterMs?: number;
}

export interface LoopHandle {
  stop: () => Promise<void>;
}

export function log(level: "info" | "error", data: Record<string, unknown>): void {
  process.stdout.write(
    JSON.stringify({ level, ts: new Date().toISOString(), ...data }) + "\n",
  );
}

export function startLoop({ jobs, jitterMs = 5000 }: LoopOptions): LoopHandle {
  let stopped = false;
  const inflight = new Map<string, Promise<void>>();
  const timers = new Map<string, NodeJS.Timeout>();

  function schedule(job: JobDefinition, delayMs: number) {
    if (stopped) return;
    const timer = setTimeout(() => {
      timers.delete(job.name);
      const task = runOnce(job).finally(() => {
        inflight.delete(job.name);
        if (!stopped) schedule(job, job.intervalSec * 1000);
      });
      inflight.set(job.name, task);
    }, delayMs);
    timers.set(job.name, timer);
  }

  async function runOnce(job: JobDefinition): Promise<void> {
    const start = Date.now();
    log("info", { job: job.name, event: "start" });
    try {
      const result = await job.run();
      log("info", {
        job: job.name,
        event: "done",
        durationMs: Date.now() - start,
        result,
      });
    } catch (error) {
      log("error", {
        job: job.name,
        event: "failed",
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const job of jobs) {
    const initialDelay = Math.floor(Math.random() * jitterMs);
    schedule(job, initialDelay);
  }

  return {
    async stop() {
      stopped = true;
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      await Promise.all(inflight.values());
    },
  };
}
