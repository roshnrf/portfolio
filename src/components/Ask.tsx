"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import calibration from "../../content/eval/calibration.json";
import {
  getServerState,
  getState,
  search,
  subscribe,
  warm,
  type SearchResult,
} from "@/lib/search/engine";
import { bestSentence } from "@/lib/search/rank";

const STAGES = ["query", "embed", "retrieve", "gate", "answer"] as const;
const STAGE_MS = 170;

const EXAMPLES = [
  "What did you build at DRDO?",
  "How accurate is ArticuPlay?",
  "Why is the gate at 0.38?",
  "What's your favourite food?",
];

/** Bars are drawn on a 0..1 similarity scale. */
const pct = (score: number) => `${Math.max(0, Math.min(1, score)) * 100}%`;

function Passage({ result }: { result: SearchResult }) {
  const { sentences, index } = bestSentence(result.query, result.top.chunk.text);
  const from = Math.max(0, index - 1);
  const shown = sentences.slice(from, index + 2);
  return (
    <p className="mt-3 leading-relaxed text-ink2">
      {from > 0 && "… "}
      {shown.map((sentence, i) =>
        from + i === index ? (
          <mark key={i} className="rounded bg-accent/25 px-0.5 text-ink">
            {sentence}{" "}
          </mark>
        ) : (
          <span key={i}>{sentence} </span>
        ),
      )}
      {from + shown.length < sentences.length && "…"}
    </p>
  );
}

export function Ask() {
  const engine = useSyncExternalStore(subscribe, getState, getServerState);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [stage, setStage] = useState(0); // 0 idle, 1..5 pipeline stages
  const [failed, setFailed] = useState(false);
  const timers = useRef<number[]>([]);
  const asked = useRef("");
  const inputId = useId();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function run(text: string, animate: boolean) {
    const question = text.trim();
    if (!question) return;
    asked.current = question;
    warm();
    setFailed(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && !reduced) setStage(1);

    try {
      const next = await search(question);
      if (asked.current !== question) return; // a newer question took over
      setResult(next);
      if (!animate || reduced) {
        setStage(5);
        return;
      }
      for (let s = 2; s <= 5; s++) {
        timers.current.push(
          window.setTimeout(() => setStage(s), (s - 1) * STAGE_MS),
        );
      }
    } catch {
      setFailed(true);
      setStage(0);
    }
  }

  // When the embedding model finishes loading, upgrade a keyword answer.
  useEffect(() => {
    if (engine.model !== "ready" || !asked.current) return;
    let cancelled = false;
    const question = asked.current;
    search(question)
      .then((next) => {
        if (!cancelled && asked.current === question) setResult(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [engine.model]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    run(query, true);
  }

  const showBars = result && stage >= 3;
  const showVerdict = result && stage >= 5;
  const answered = result?.verdict === "answer";

  const modelNote =
    engine.model === "ready"
      ? "semantic model ready"
      : engine.model === "loading"
        ? `loading semantic model ${engine.progress}%, keyword matching until then`
        : engine.model === "failed"
          ? "semantic model unavailable, using keyword matching"
          : "runs in your browser";

  return (
    <div className="glass overflow-hidden">
      <form onSubmit={onSubmit} className="flex items-center gap-2 p-3 sm:p-4">
        <label htmlFor={inputId} className="sr-only">
          Ask a question about Roshan&apos;s work
        </label>
        <span aria-hidden="true" className="pl-2 font-mono text-accent-soft">
          &gt;
        </span>
        <input
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={warm}
          placeholder="Ask about my work…"
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base outline-none placeholder:text-ink3"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Ask
        </button>
      </form>

      <ul className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button
              type="button"
              onClick={() => {
                setQuery(example);
                run(example, true);
              }}
              onPointerEnter={warm}
              className="chip cursor-pointer transition-colors hover:border-accent hover:text-ink"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-4 py-4 sm:px-5">
        {/* Pipeline stages */}
        <ol
          aria-hidden="true"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"
        >
          {STAGES.map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 transition-colors duration-200 ${
                  stage > i
                    ? i === 3 && showVerdict && !answered
                      ? "border-warn/60 text-warn"
                      : "border-accent/60 text-accent-soft"
                    : "border-line text-ink3"
                }`}
              >
                {name}
              </span>
              {i < STAGES.length - 1 && <span className="text-ink3">→</span>}
            </li>
          ))}
        </ol>

        {/* Results. min-height keeps the page from jumping. */}
        <div className="mt-4 min-h-[15.5rem]" aria-live="polite">
          {failed && (
            <p className="text-sm text-warn">
              The search index could not be loaded. Check your connection and
              try again.
            </p>
          )}

          {!result && !failed && (
            <p className="max-w-xl text-sm leading-relaxed text-ink3">
              Type a question or pick one above. Your question is matched
              against every page on this site, here in your browser. If the best
              match is not confident enough, you get told so instead of a
              guess.
            </p>
          )}

          {showBars && (
            <div>
              <div className="relative space-y-2">
                {result.sources.map((source) => (
                  <div
                    key={source.source}
                    className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2.75rem] items-center gap-3 text-xs sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_2.75rem]"
                  >
                    <span className="truncate text-ink2">{source.source}</span>
                    <span className="relative h-2 rounded-full bg-white/5">
                      <span
                        className={`bar absolute inset-y-0 left-0 rounded-full ${
                          source.score >= result.threshold ? "bg-ok" : "bg-ink3"
                        }`}
                        style={{ width: pct(source.score) }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -inset-y-1 w-px bg-warn"
                        style={{ left: pct(result.threshold) }}
                      />
                    </span>
                    <span className="text-right font-mono tabular-nums text-ink2">
                      {source.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 font-mono text-[0.7rem] text-ink3">
                <span className="text-warn">│</span> gate at{" "}
                {result.threshold.toFixed(2)} ·{" "}
                {result.mode === "semantic"
                  ? "semantic + keyword score"
                  : "keyword score"}
              </p>
            </div>
          )}

          {showVerdict && answered && (
            <div className="mt-4 rounded-xl border border-ok/30 bg-ok/5 p-4">
              <p className="font-mono text-xs text-ok">
                ✓ confident · {result.top.score.toFixed(2)} ≥{" "}
                {result.threshold.toFixed(2)}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {result.top.chunk.source}
                {result.top.chunk.heading && (
                  <span className="font-normal text-ink3">
                    {" "}
                    · {result.top.chunk.heading}
                  </span>
                )}
              </p>
              <Passage result={result} />
              <Link
                href={result.top.chunk.url}
                className="link mt-3 inline-block text-sm"
              >
                Read it in context →
              </Link>
            </div>
          )}

          {showVerdict && !answered && (
            <div className="mt-4 rounded-xl border border-warn/30 bg-warn/5 p-4">
              <p className="font-mono text-xs text-warn">
                ✕ not confident · {result.top.score.toFixed(2)} &lt;{" "}
                {result.threshold.toFixed(2)}
              </p>
              <p className="mt-2 leading-relaxed text-ink2">
                Nothing on this site answers that well enough, so I would
                rather say so than guess. Try asking about a project, my
                studies, or how to reach me.
              </p>
            </div>
          )}
        </div>

        <details className="mt-3 text-xs text-ink3">
          <summary className="cursor-pointer select-none font-mono hover:text-ink2">
            how this works · {modelNote}
          </summary>
          <div className="mt-3 max-w-2xl space-y-2 leading-relaxed">
            <p>
              Every page on this site is split into {calibration.passages}{" "}
              passages and embedded at build time with all-MiniLM-L6-v2. Your
              question is embedded by the same model running in your browser,
              then scored against each passage (cosine similarity plus a bonus
              for exact keyword matches). Nothing you type leaves this page.
            </p>
            <p>
              The gate is calibrated the way I calibrated Scheme Sahayak&apos;s:{" "}
              {calibration.onTopic.n} questions the site can answer scored a
              median of {calibration.onTopic.median.toFixed(2)};{" "}
              {calibration.offTopic.n} it cannot scored a median of{" "}
              {calibration.offTopic.median.toFixed(2)}. A gate at{" "}
              {calibration.threshold.toFixed(2)} answers{" "}
              {calibration.answeredOnTopic} of {calibration.onTopic.n} and
              refuses {calibration.refusedOffTopic} of {calibration.offTopic.n}.
              It is not perfect: short questions that share a common word with
              a page can still slip through.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
