import type { Chunk } from "./chunk";
import { splitSentences, tokenize } from "./text";

export type Hit = { chunk: Chunk; score: number };
export type SourceScore = { source: string; url: string; score: number };
export type Verdict = "answer" | "refuse";

/** Dot product. Index and query vectors are L2-normalised, so this is cosine similarity. */
export function dot(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export function semanticScores(
  query: ArrayLike<number>,
  vectors: ArrayLike<number>[],
): number[] {
  return vectors.map((v) => dot(query, v));
}

/**
 * Keyword match strength per chunk, in 0..1.
 * BM25 relative to the best chunk, scaled by the share of the query that
 * matched. The share is weighted by rarity (IDF), so missing a rare word such
 * as "DRDO" costs more than missing a common one such as "build".
 */
export function keywordScores(query: string, texts: string[]): number[] {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return texts.map(() => 0);

  const docs = texts.map((t) => tokenize(t));
  const avgLength = docs.reduce((n, d) => n + d.length, 0) / (docs.length || 1);
  const k1 = 1.4;
  const b = 0.75;
  const idfOf = (df: number) =>
    Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));

  const idf = new Map<string, number>();
  for (const term of terms) {
    idf.set(term, idfOf(docs.filter((d) => d.includes(term)).length));
  }

  const totalIdf = terms.reduce((n, t) => n + idf.get(t)!, 0);

  const raw = docs.map((doc) => {
    let score = 0;
    let matchedIdf = 0;
    for (const term of terms) {
      const tf = doc.filter((w) => w === term).length;
      if (tf === 0) continue;
      matchedIdf += idf.get(term)!;
      score +=
        (idf.get(term)! * tf * (k1 + 1)) /
        (tf + k1 * (1 - b + (b * doc.length) / avgLength));
    }
    return { score, coverage: matchedIdf / totalIdf };
  });

  const best = Math.max(...raw.map((r) => r.score), 0);
  if (best === 0) return texts.map(() => 0);
  return raw.map((r) => (r.score / best) * r.coverage);
}

/** How much an exact keyword match adds on top of semantic similarity. */
export const KEYWORD_WEIGHT = 0.35;

/** Added when the question names a page by its title ("What is ArticuPlay?"). */
export const TITLE_BONUS = 0.15;

/** Dated posts rank slightly below the canonical project and profile pages. */
const KIND_WEIGHT: Record<Chunk["kind"], number> = {
  project: 1,
  profile: 1,
  post: 0.7,
  update: 0.85,
};

/**
 * Semantic similarity plus a keyword bonus. Small embedding models are weak
 * on names and acronyms ("DRDO", "mix-minus", "C"); exact matches cover that.
 */
export function hybridScores(
  query: string,
  semantic: number[],
  keyword: number[],
  chunks: Chunk[],
  keywordWeight = KEYWORD_WEIGHT,
): number[] {
  const asked = new Set(tokenize(query));
  return chunks.map((chunk, i) => {
    const title = tokenize(chunk.source);
    const namedDirectly =
      title.length > 0 && title.length <= 3 && title.every((w) => asked.has(w));
    return (
      (semantic[i] + keywordWeight * keyword[i] + (namedDirectly ? TITLE_BONUS : 0)) *
      KIND_WEIGHT[chunk.kind]
    );
  });
}

/** Highest-scoring chunks first. */
export function topHits(scores: number[], chunks: Chunk[], k = 5): Hit[] {
  return chunks
    .map((chunk, i) => ({ chunk, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Best score per page, for the score bars. */
export function bySource(scores: number[], chunks: Chunk[], k = 4): SourceScore[] {
  const best = new Map<string, SourceScore>();
  chunks.forEach((chunk, i) => {
    const current = best.get(chunk.source);
    if (!current || scores[i] > current.score) {
      best.set(chunk.source, {
        source: chunk.source,
        url: chunk.url,
        score: scores[i],
      });
    }
  });
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, k);
}

/** The confidence gate: answer only when the best match clears the threshold. */
export function decide(topScore: number, threshold: number): Verdict {
  return topScore >= threshold ? "answer" : "refuse";
}

/** Index of the sentence that shares the most content words with the query. */
export function bestSentence(query: string, text: string): {
  sentences: string[];
  index: number;
} {
  const sentences = splitSentences(text);
  const terms = new Set(tokenize(query));
  let index = 0;
  let bestScore = 0;
  sentences.forEach((sentence, i) => {
    const words = new Set(tokenize(sentence));
    let overlap = 0;
    for (const term of terms) if (words.has(term)) overlap++;
    if (overlap > bestScore) {
      bestScore = overlap;
      index = i;
    }
  });
  return { sentences, index };
}
