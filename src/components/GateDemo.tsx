"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getServerState,
  getState,
  search,
  SEMANTIC_THRESHOLD,
  subscribe,
  warm,
} from "@/lib/search/engine";

const QUESTIONS: { q: string; real: boolean }[] = [
  { q: "Which languages does Scheme Sahayak support?", real: true },
  { q: "How fast does the voice assistant respond?", real: true },
  { q: "What did you build at DRDO?", real: true },
  { q: "How does the jitter buffer work?", real: true },
  { q: "Who won the football World Cup?", real: false },
  { q: "What is the stock market doing today?", real: false },
  { q: "Recommend a good movie", real: false },
  { q: "What's your favourite food?", real: false },
];

type Row = { q: string; real: boolean; score: number };

/**
 * A hands-on version of the confidence gate: the same questions, scored once,
 * with a slider that moves the threshold.
 */
export function GateDemo() {
  const engine = useSyncExternalStore(subscribe, getState, getServerState);
  const [started, setStarted] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [gate, setGate] = useState(SEMANTIC_THRESHOLD);

  // Score every question once the embedding model is ready.
  useEffect(() => {
    if (!started || engine.model !== "ready") return;
    let cancelled = false;
    Promise.all(
      QUESTIONS.map(async (item) => ({
        ...item,
        score: (await search(item.q)).top.score,
      })),
    )
      .then((scored) => {
        if (!cancelled) setRows(scored);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [started, engine.model]);

  const answeredReal = rows?.filter((r) => r.real && r.score >= gate).length ?? 0;
  const refusedOther = rows?.filter((r) => !r.real && r.score < gate).length ?? 0;
  const reals = QUESTIONS.filter((x) => x.real).length;

  return (
    <section className="glass mt-12 p-5 sm:p-6" aria-labelledby="gate-demo">
      <p className="label">Try it</p>
      <h2 id="gate-demo" className="mt-2 text-xl font-semibold tracking-tight">
        Move the gate yourself
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink2">
        This runs the same mechanism on this website&apos;s own content, not on
        the scheme database: eight questions are scored against every page, and
        the gate decides which ones get an answer. Slide it to see why the
        threshold has to sit in the gap.
      </p>

      {!started && (
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => {
            setStarted(true);
            warm();
          }}
        >
          Run the demo
        </button>
      )}

      {started && !rows && (
        <p className="mt-5 font-mono text-xs text-ink3" aria-live="polite">
          {engine.model === "failed"
            ? "The embedding model could not be loaded in this browser."
            : `loading the embedding model ${engine.progress}%…`}
        </p>
      )}

      {rows && (
        <>
          <label className="mt-6 block text-sm">
            <span className="flex items-baseline justify-between">
              <span className="text-ink2">Gate threshold</span>
              <span className="font-mono tabular-nums">{gate.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.05}
              max={0.9}
              step={0.01}
              value={gate}
              onChange={(e) => setGate(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-accent)]"
            />
          </label>

          <ul className="mt-4 space-y-2.5">
            {rows.map((row) => {
              const answered = row.score >= gate;
              const correct = answered === row.real;
              return (
                <li
                  key={row.q}
                  className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_5.5rem]"
                >
                  <span className="truncate">
                    <span className="mr-2 font-mono text-[0.65rem] text-ink3">
                      {row.real ? "about me" : "unrelated"}
                    </span>
                    {row.q}
                  </span>
                  <span className="relative col-span-2 row-start-2 h-2 rounded-full bg-white/5 sm:col-span-1 sm:row-start-auto">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full ${answered ? "bg-ok" : "bg-ink3"}`}
                      style={{ width: `${Math.min(1, row.score) * 100}%` }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -inset-y-1 w-px bg-warn"
                      style={{ left: `${gate * 100}%` }}
                    />
                  </span>
                  <span
                    className={`text-right font-mono text-xs ${correct ? "text-ok" : "text-warn"}`}
                  >
                    {answered ? "answers" : "refuses"} {correct ? "✓" : "✕"}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-sm text-ink2" aria-live="polite">
            At {gate.toFixed(2)}: answers {answeredReal} of {reals} real
            questions, refuses {refusedOther} of {QUESTIONS.length - reals}{" "}
            unrelated ones.{" "}
            {gate < 0.2
              ? "Too low: it answers things it knows nothing about."
              : gate > 0.6
                ? "Too high: it refuses questions it could answer."
                : ""}
          </p>
          <button
            type="button"
            className="link mt-2 text-xs"
            onClick={() => setGate(SEMANTIC_THRESHOLD)}
          >
            Reset to the calibrated value ({SEMANTIC_THRESHOLD.toFixed(2)})
          </button>
        </>
      )}
    </section>
  );
}
