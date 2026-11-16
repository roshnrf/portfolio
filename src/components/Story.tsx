"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile, story, type StoryScene } from "@/data/profile";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

/**
 * How far an element has travelled up the viewport, 0..1.
 * 0 as its top enters near the bottom, 1 once it sits in the upper third.
 */
function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(id);
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top } = element.getBoundingClientRect();
      const start = window.innerHeight * 0.92;
      const end = window.innerHeight * 0.3;
      setProgress(Math.round(clamp((start - top) / (start - end)) * 50) / 50);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [ref, progress] as const;
}

/* ---------- ArticuPlay: phoneme alignment ---------- */

const SAID = ["w", "æ", "b", "ɪ", "t"];
const TARGET = ["ɹ", "æ", "b", "ɪ", "t"];

function PhonemeRow({
  label,
  phones,
  note,
  tone,
  visible,
}: {
  label: string;
  phones: string[];
  note: string;
  tone: "plain" | "bad" | "good";
  visible: boolean;
}) {
  return (
    <div
      className={`transition-all duration-500 ${visible ? "opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <p className="font-mono text-[0.7rem] text-ink3">{label}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {phones.map((phone, i) => {
          const differs = phone !== TARGET[i];
          return (
            <span
              key={i}
              className={`grid h-9 w-9 place-items-center rounded-lg border font-mono text-base ${
                tone === "good" && differs
                  ? "border-ok/60 bg-ok/10 text-ok"
                  : "border-line bg-white/[0.03] text-ink"
              }`}
            >
              {phone}
            </span>
          );
        })}
        <span
          className={`ml-2 text-xs leading-snug ${
            tone === "bad" ? "text-warn" : tone === "good" ? "text-ok" : "text-ink3"
          }`}
        >
          {note}
        </span>
      </div>
    </div>
  );
}

function PhonemeScene({ p }: { p: number }) {
  const accuracy = 80 + 16 * ease((p - 0.45) / 0.5);
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink2">
        Target word: <span className="font-semibold text-ink">rabbit</span>
      </p>
      <PhonemeRow
        label="what the child says"
        phones={SAID}
        note="“wabbit”"
        tone="plain"
        visible={p > 0.05}
      />
      <PhonemeRow
        label="stock speech model hears"
        phones={TARGET}
        note="“rabbit”, marked correct"
        tone="bad"
        visible={p > 0.25}
      />
      <PhonemeRow
        label="fine-tuned model hears"
        phones={SAID}
        note="ɹ → w substitution"
        tone="good"
        visible={p > 0.45}
      />
      <div className="pt-2">
        <div className="flex items-baseline justify-between text-xs text-ink3">
          <span>phoneme accuracy, 30 held-out words</span>
          <span className="font-mono text-lg tabular-nums text-ok">
            {accuracy.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-ok"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>
      <p className="text-[0.7rem] text-ink3">
        The word is an illustration of the error type; the accuracy figures are
        measured.
      </p>
    </div>
  );
}

/* ---------- Scheme Sahayak: the confidence gate ---------- */

function GateScene({ p }: { p: number }) {
  const lo = 0.2;
  const hi = 0.56;
  const x = (score: number) => 20 + ((score - lo) / (hi - lo)) * 360;
  const score = 0.23 + ease(p) * 0.27;
  const answers = score >= 0.38;
  return (
    <div>
      <svg viewBox="0 0 400 150" className="w-full" role="img" aria-label="Retrieval scores for unrelated questions fall between 0.27 and 0.37, genuine ones between 0.40 and 0.50, with the gate at 0.38 between them.">
        <rect x={x(0.27)} y="52" width={x(0.37) - x(0.27)} height="26" rx="6" className="fill-warn/20 stroke-warn/50" />
        <rect x={x(0.4)} y="52" width={x(0.5) - x(0.4)} height="26" rx="6" className="fill-ok/20 stroke-ok/50" />
        <text x={(x(0.27) + x(0.37)) / 2} y="42" textAnchor="middle" className="fill-warn text-[9px]">unrelated questions</text>
        <text x={(x(0.4) + x(0.5)) / 2} y="42" textAnchor="middle" className="fill-ok text-[9px]">genuine questions</text>
        <line x1="20" x2="380" y1="92" y2="92" className="stroke-line" />
        {[0.2, 0.3, 0.4, 0.5].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1="89" y2="95" className="stroke-ink3" />
            <text x={x(tick)} y="108" textAnchor="middle" className="fill-ink3 font-mono text-[9px]">{tick.toFixed(2)}</text>
          </g>
        ))}
        <line x1={x(0.38)} x2={x(0.38)} y1="20" y2="98" strokeDasharray="3 3" className="stroke-ink" />
        <text x={x(0.38)} y="14" textAnchor="middle" className="fill-ink font-mono text-[9px]">gate 0.38</text>
        <circle cx={x(score)} cy="65" r="6" className={answers ? "fill-ok" : "fill-warn"} />
        <text x={x(score)} y="132" textAnchor="middle" className="fill-ink2 font-mono text-[10px]">score {score.toFixed(2)}</text>
      </svg>
      <p
        className={`mt-2 rounded-lg border px-3 py-2 text-sm ${
          answers ? "border-ok/30 bg-ok/5 text-ok" : "border-warn/30 bg-warn/5 text-warn"
        }`}
      >
        {answers
          ? "Above the gate: the answer is spoken, grounded in the scheme text."
          : "Below the gate: no source to back an answer, so the agent says so."}
      </p>
    </div>
  );
}

/* ---------- StoryWeaver: the five-step loop ---------- */

const STEPS = [
  ["Describe", "the child talks about a picture"],
  ["Transcribe", "Whisper turns speech into text"],
  ["Analyse", "Gemini finds the difficult words"],
  ["Generate", "a short story built around them"],
  ["Practise", "read it aloud, line by line"],
] as const;

function PipelineScene({ p }: { p: number }) {
  const lit = Math.round(ease(p / 0.7) * STEPS.length);
  const grown = ease((p - 0.55) / 0.45);
  return (
    <div>
      <ol className="space-y-2">
        {STEPS.map(([name, detail], i) => (
          <li
            key={name}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-300 ${
              i < lit ? "border-accent/50 bg-accent/10" : "border-line"
            }`}
          >
            <span
              className={`font-mono text-xs ${i < lit ? "text-accent-soft" : "text-ink3"}`}
            >
              {i + 1}
            </span>
            <span
              className={`text-sm font-medium ${i < lit ? "text-ink" : "text-ink3"}`}
            >
              {name}
            </span>
            <span className="ml-auto text-right text-xs text-ink3">{detail}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 space-y-2">
        <p className="text-xs text-ink3">practice accuracy in the pilot</p>
        {[
          { label: "Session 1", value: 72, scale: 1 },
          { label: "Session 6", value: 87, scale: grown },
        ].map(({ label, value, scale }) => (
          <div
            key={label}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-xs"
          >
            <span className="text-ink2">{label}</span>
            <span className="h-2 rounded-full bg-white/5">
              <span
                className="block h-full rounded-full bg-ok"
                style={{ width: `${value * scale}%` }}
              />
            </span>
            <span className="text-right font-mono tabular-nums text-ink2">
              {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- PIRS: 4,000 users, five insiders ---------- */

const COLS = 80;
const ROWS = 50;
const USERS = COLS * ROWS;

/** Deterministic pseudo-random order so the picture is the same on every visit. */
const RANK = (() => {
  const order = Array.from({ length: USERS }, (_, i) => i);
  let seed = 20260;
  for (let i = USERS - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order; // RANK[k] = dot index of the k-th riskiest user
})();
const TOP = USERS * 0.05; // 200 users
const INSIDER_RANKS = [11, 64, 157, 1310, 2745]; // three inside the top 5%, two outside

function InsiderScene({ p }: { p: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flagged = Math.round(ease(p / 0.6) * TOP);
  const showInsiders = p > 0.6;

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = el.clientWidth;
    const height = (width * ROWS) / COLS;
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.scale(dpr, dpr);
    const cell = width / COLS;
    const at = (index: number) => ({
      x: (index % COLS) * cell + cell / 2,
      y: Math.floor(index / COLS) * cell + cell / 2,
    });

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    for (let i = 0; i < USERS; i++) {
      const { x, y } = at(i);
      ctx.beginPath();
      ctx.arc(x, y, cell * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#9aa2f0";
    for (let k = 0; k < flagged; k++) {
      const { x, y } = at(RANK[k]);
      ctx.beginPath();
      ctx.arc(x, y, cell * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
    if (showInsiders) {
      for (const rank of INSIDER_RANKS) {
        const { x, y } = at(RANK[rank]);
        const caught = rank < TOP;
        ctx.strokeStyle = caught ? "#30d68a" : "#fb923c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, cell * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = caught ? "#30d68a" : "#fb923c";
        ctx.beginPath();
        ctx.arc(x, y, cell * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [flagged, showInsiders]);

  return (
    <div>
      <canvas
        ref={canvas}
        className="block w-full"
        role="img"
        aria-label="A grid of 4,000 dots, one per user. Two hundred are highlighted as the top 5% of risk. Three of the five labelled insiders fall inside that group and two fall outside."
      />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink2">
        <li><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent-soft" />top 5% of risk: {flagged} of 4,000</li>
        <li className={showInsiders ? "" : "opacity-0"}><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-ok" />3 insiders caught</li>
        <li className={showInsiders ? "" : "opacity-0"}><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-warn" />2 missed (single-day attacks)</li>
      </ul>
      <p className="mt-1 text-[0.7rem] text-ink3">
        Counts are from the CERT r6.2 results; dot positions are arbitrary.
      </p>
    </div>
  );
}

/* ---------- Now ---------- */

function NowScene() {
  return (
    <div className="space-y-4">
      <p className="label">{profile.eyebrow}</p>
      <p className="flex items-center gap-2 text-ink2">
        <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ok" />
        {profile.availability}
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={`mailto:${profile.email}`} className="btn btn-primary">
          Email me
        </a>
        <a href={profile.links.resume} target="_blank" rel="noopener" className="btn">
          Resume (PDF)
        </a>
        <a href={profile.links.linkedin} className="btn">
          LinkedIn
        </a>
      </div>
    </div>
  );
}

function Scene({ scene, p }: { scene: StoryScene; p: number }) {
  if (scene === "phonemes") return <PhonemeScene p={p} />;
  if (scene === "gate") return <GateScene p={p} />;
  if (scene === "pipeline") return <PipelineScene p={p} />;
  if (scene === "insiders") return <InsiderScene p={p} />;
  return <NowScene />;
}

function Chapter({ chapter, flip }: { chapter: (typeof story)[number]; flip: boolean }) {
  const [ref, p] = useScrollProgress<HTMLDivElement>();
  return (
    <article className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14 lg:py-20">
      <div className={flip ? "lg:order-2" : ""}>
        <p className="label">{chapter.kicker}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.9rem] sm:leading-tight">
          {chapter.title}
        </h3>
        <div className="mt-4 space-y-3 leading-relaxed text-ink2">
          {chapter.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Link href={chapter.href} className="link mt-5 inline-block text-sm">
          {chapter.link} →
        </Link>
      </div>
      <div ref={ref} className="glass p-5 sm:p-6">
        <Scene scene={chapter.scene} p={p} />
      </div>
    </article>
  );
}

export function Story() {
  return (
    <div className="divide-y divide-line">
      {story.map((chapter, i) => (
        <Chapter key={chapter.scene} chapter={chapter} flip={i % 2 === 1} />
      ))}
    </div>
  );
}
