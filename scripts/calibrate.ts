// Calibrates the confidence gate from data, the same way Scheme Sahayak's
// 0.38 threshold was chosen: score questions the site can answer and questions
// it cannot, look at where the two groups land, and put the gate between them.
//
//   npm run index && npm run calibrate
//
// Writes content/eval/calibration.json, which the site reads.
import fs from "node:fs";
import path from "node:path";
import type { Chunk } from "../src/lib/search/chunk";
import { hybridScores, keywordScores, semanticScores, topHits } from "../src/lib/search/rank";
import { embed } from "./lib/embed";

const root = process.cwd();
const index = JSON.parse(
  fs.readFileSync(path.join(root, "public", "search-index.json"), "utf8"),
) as { chunks: Chunk[]; vectors: number[][] };
const questions = JSON.parse(
  fs.readFileSync(path.join(root, "content", "eval", "questions.json"), "utf8"),
) as { onTopic: { q: string; expect: string }[]; offTopic: string[] };

const texts = index.chunks.map((c) => [c.source, c.heading, c.text].join(" "));
const score = (q: string, v: number[]) =>
  hybridScores(q, semanticScores(v, index.vectors), keywordScores(q, texts), index.chunks);

const round = (x: number) => Math.round(x * 1000) / 1000;
const quantile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

function summarise(scores: number[]) {
  const sorted = [...scores].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: round(sorted[0]),
    p10: round(quantile(sorted, 0.1)),
    median: round(quantile(sorted, 0.5)),
    p90: round(quantile(sorted, 0.9)),
    max: round(sorted[sorted.length - 1]),
  };
}

/**
 * Try every candidate threshold and keep the one with the fewest mistakes.
 * Ties go to the higher threshold: a wrong answer costs more than a refusal.
 */
function pickThreshold(onScores: number[], offScores: number[]): number {
  let best = { threshold: 0, errors: Infinity };
  for (let t = 0.05; t <= 0.9; t += 0.005) {
    const errors =
      onScores.filter((s) => s < t).length + offScores.filter((s) => s >= t).length;
    if (errors <= best.errors) best = { threshold: round(t), errors };
  }
  return best.threshold;
}

async function main() {
  const onVectors = await embed(questions.onTopic.map((x) => x.q));
  const offVectors = await embed(questions.offTopic);

  const on = questions.onTopic.map((item, i) => {
    const [top] = topHits(score(item.q, onVectors[i]), index.chunks, 1);
    return { ...item, score: top.score, url: top.chunk.url, source: top.chunk.source };
  });
  const off = questions.offTopic.map((q, i) => {
    const [top] = topHits(score(q, offVectors[i]), index.chunks, 1);
    return { q, score: top.score, source: top.chunk.source };
  });

  const t = pickThreshold(on.map((x) => x.score), off.map((x) => x.score));

  // Keyword-only mode (before the model has loaded) gets its own gate.
  const keywordTop = (q: string) => Math.max(...keywordScores(q, texts));
  const keywordThreshold = pickThreshold(
    questions.onTopic.map((x) => keywordTop(x.q)),
    questions.offTopic.map(keywordTop),
  );

  const wrongPage = on.filter((x) => !x.url.startsWith(x.expect));
  const result = {
    model: "Xenova/all-MiniLM-L6-v2 (q8)",
    passages: index.chunks.length,
    threshold: t,
    keywordThreshold,
    onTopic: summarise(on.map((x) => x.score)),
    offTopic: summarise(off.map((x) => x.score)),
    answeredOnTopic: on.filter((x) => x.score >= t).length,
    refusedOffTopic: off.filter((x) => x.score < t).length,
    rightPageTop1: on.length - wrongPage.length,
    keywordOnly: {
      answeredOnTopic: questions.onTopic.filter((x) => keywordTop(x.q) >= keywordThreshold).length,
      refusedOffTopic: questions.offTopic.filter((q) => keywordTop(q) < keywordThreshold).length,
    },
  };

  fs.writeFileSync(
    path.join(root, "content", "eval", "calibration.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );

  console.log(result);
  console.log("\nOn-topic questions refused:");
  on.filter((x) => x.score < t).forEach((x) => console.log(`  ${round(x.score)}  ${x.q}`));
  console.log("\nOff-topic questions answered:");
  off.filter((x) => x.score >= t).forEach((x) =>
    console.log(`  ${round(x.score)}  ${x.q}  -> ${x.source}`),
  );
  console.log("\nOn-topic questions sent to an unexpected page:");
  wrongPage.forEach((x) => console.log(`  ${round(x.score)}  ${x.q}  -> ${x.url}`));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
