import { parentPort } from "node:worker_threads";
import { type Weights, resetWeights, setWeights } from "../ai/values";
import { allConfigs, playGame } from "../game";
import { addResult, emptyTally } from "./stats";

export interface Job {
  config: number;
  start: number;
  end: number;
  seed: number;
  weights?: Partial<Weights>;
}

const configs = allConfigs();

parentPort?.on("message", (job: Job | null) => {
  if (!job) process.exit(0);
  resetWeights();
  if (job.weights) setWeights(job.weights);
  const tally = emptyTally();
  for (let g = job.start; g < job.end; g++) {
    const t0 = performance.now();
    const r = playGame(configs[job.config], job.seed, g);
    addResult(tally, r, performance.now() - t0);
  }
  parentPort!.postMessage({ job, tally });
});
