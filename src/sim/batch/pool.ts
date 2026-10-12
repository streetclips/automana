import { Worker } from "node:worker_threads";
import type { Tally } from "./stats";
import type { Job } from "./worker";

export class Pool {
  private readonly workers: Worker[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) this.workers.push(new Worker(new URL("./worker.ts", import.meta.url), { execArgv: ["--import", "tsx"] }));
  }

  run(jobs: Job[], onResult: (job: Job, tally: Tally) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      let next = 0;
      let pending = 0;
      const feed = (w: Worker): void => {
        if (next < jobs.length) {
          pending++;
          w.postMessage(jobs[next++]);
        } else if (pending === 0) resolve();
      };
      for (const w of this.workers) {
        w.removeAllListeners("message");
        w.removeAllListeners("error");
        w.on("error", reject);
        w.on("message", ({ job, tally }: { job: Job; tally: Tally }) => {
          pending--;
          onResult(job, tally);
          feed(w);
        });
      }
      for (const w of this.workers) feed(w);
      if (!jobs.length) resolve();
    });
  }

  close(): void {
    for (const w of this.workers) w.postMessage(null);
  }
}
