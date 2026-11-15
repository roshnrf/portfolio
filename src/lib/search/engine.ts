// Browser-side search engine. One shared instance per page: the hero, the
// command palette and the gate demo all use the same index and model.
import calibration from "../../../content/eval/calibration.json";
import type { Chunk } from "./chunk";
import {
  bySource,
  decide,
  hybridScores,
  keywordScores,
  semanticScores,
  topHits,
  type Hit,
  type SourceScore,
  type Verdict,
} from "./rank";

export type ModelStatus = "idle" | "loading" | "ready" | "failed";
export type EngineState = { model: ModelStatus; progress: number };

export type SearchResult = {
  query: string;
  mode: "semantic" | "keyword";
  threshold: number;
  verdict: Verdict;
  top: Hit;
  sources: SourceScore[];
};

type SearchIndex = { chunks: Chunk[]; vectors: number[][]; texts: string[] };
type Pending = { resolve: (v: number[]) => void; reject: (e: Error) => void };

export const SEMANTIC_THRESHOLD = calibration.threshold;
export const KEYWORD_THRESHOLD = calibration.keywordThreshold;

let state: EngineState = { model: "idle", progress: 0 };
const listeners = new Set<() => void>();
const pending = new Map<number, Pending>();
let worker: Worker | undefined;
let indexPromise: Promise<SearchIndex> | undefined;
let nextId = 0;

function setState(patch: Partial<EngineState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getState = () => state;
const serverState: EngineState = { model: "idle", progress: 0 };
export const getServerState = () => serverState;

function loadIndex(): Promise<SearchIndex> {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`index ${response.status}`);
      return response.json();
    })
    .then((index: { chunks: Chunk[]; vectors: number[][] }) => ({
      ...index,
      texts: index.chunks.map((c) => [c.source, c.heading, c.text].join(" ")),
    }))
    .catch((error) => {
      indexPromise = undefined; // allow a retry on the next question
      throw error;
    });
  return indexPromise;
}

function failModel() {
  setState({ model: "failed" });
  pending.forEach((p) => p.reject(new Error("embedding model unavailable")));
  pending.clear();
}

/** Start fetching the index and the model. Safe to call many times. */
export function warm() {
  loadIndex().catch(() => {});
  if (worker || state.model !== "idle") return;
  try {
    worker = new Worker("/embed-worker.js", { type: "module" });
  } catch {
    failModel();
    return;
  }
  setState({ model: "loading" });
  worker.onmessage = (event: MessageEvent) => {
    const message = event.data;
    if (message.type === "progress") setState({ progress: message.progress });
    else if (message.type === "ready") setState({ model: "ready", progress: 100 });
    else if (message.type === "vector") {
      pending.get(message.id)?.resolve(message.vector);
      pending.delete(message.id);
    } else if (message.type === "error") failModel();
  };
  worker.onerror = failModel;
  worker.postMessage({ type: "load" });
}

function embedQuery(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    worker!.postMessage({ type: "embed", id, text });
  });
}

/**
 * Answer a question from the site's own content.
 * Uses the embedding model when it is ready, keyword matching otherwise.
 * `threshold` overrides the calibrated gate (the gate demo uses this).
 */
export async function search(
  query: string,
  threshold?: number,
): Promise<SearchResult> {
  const index = await loadIndex();
  const keyword = keywordScores(query, index.texts);

  let mode: SearchResult["mode"] = "keyword";
  let scores = keyword;
  if (state.model === "ready") {
    try {
      const vector = await embedQuery(query);
      scores = hybridScores(
        query,
        semanticScores(vector, index.vectors),
        keyword,
        index.chunks,
      );
      mode = "semantic";
    } catch {
      // fall through to the keyword result
    }
  }

  const gate =
    threshold ?? (mode === "semantic" ? SEMANTIC_THRESHOLD : KEYWORD_THRESHOLD);
  const [top] = topHits(scores, index.chunks, 1);
  return {
    query,
    mode,
    threshold: gate,
    verdict: decide(top.score, gate),
    top,
    sources: bySource(scores, index.chunks),
  };
}
