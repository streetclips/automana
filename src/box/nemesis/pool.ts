import { Worker } from 'node:worker_threads';
import type { Tally } from './stats';
import type { Job } from './worker';

export class Pool {
  private readonly workers: Worker[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.workers.push(new Worker(new URL('./worker.ts', import.meta.url), { execArgv: ['--import', 'tsx'] }));
    }
  }

  run(jobs: Job[], onResult: (job: Job, tally: Tally) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      let next = 0;
      let pending = 0;
      const feed = (worker: Worker): void => {
        if (next < jobs.length) {
          pending++;
          worker.postMessage(jobs[next++]);
        } else if (pending === 0) resolve();
      };
      for (const worker of this.workers) {
        worker.on('error', reject);
        worker.on('message', ({ job, tally }: { job: Job; tally: Tally }) => {
          pending--;
          onResult(job, tally);
          feed(worker);
        });
      }
      for (const worker of this.workers) feed(worker);
      if (jobs.length === 0) resolve();
    });
  }

  close(): void {
    for (const worker of this.workers) worker.postMessage(null);
  }
}
