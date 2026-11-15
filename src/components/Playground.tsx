"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  evaluate,
  makeDataset,
  train,
  type Algo,
  type DatasetName,
  type DistanceMetric,
  type Point,
} from "@/lib/classifiers";

const W = 640;
const H = 520;
const CELL = 4; // boundary resolution in canvas pixels

const CLASS_RGB = [
  [48, 214, 138], // A, green
  [248, 113, 113], // B, red
] as const;

const DATASETS: DatasetName[] = [
  "blobs",
  "circles",
  "moons",
  "xor",
  "spiral",
  "linear",
];

const ALGOS: { id: Algo; name: string; note: string }[] = [
  {
    id: "knn",
    name: "K-nearest neighbours",
    note: "Votes among the K closest points. Handles any shape; small K overfits.",
  },
  {
    id: "perceptron",
    name: "Perceptron",
    note: "A single linear unit. It can only draw a straight line, so XOR and circles defeat it.",
  },
  {
    id: "nb",
    name: "Gaussian naive Bayes",
    note: "Fits one axis-aligned Gaussian per class and picks the likelier one.",
  },
];

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-ink2">
        {props.label}
        <span className="font-mono text-ink">
          {props.format ? props.format(props.value) : props.value}
        </span>
      </span>
      <input
        type="range"
        className="mt-2 h-6 w-full accent-accent"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [klass, setKlass] = useState<0 | 1>(0);
  const [algo, setAlgo] = useState<Algo>("knn");
  const [k, setK] = useState(5);
  const [metric, setMetric] = useState<DistanceMetric>("euclidean");
  const [learningRate, setLearningRate] = useState(0.1);
  const [epochs, setEpochs] = useState(50);
  const [smoothing, setSmoothing] = useState(100);

  // Retrain whenever the data or a hyperparameter changes.
  const result = useMemo(() => {
    const predict = train(points, algo, {
      k,
      metric,
      learningRate,
      epochs,
      smoothing,
    });
    if (!predict) return null;
    const cols = Math.ceil(W / CELL);
    const rows = Math.ceil(H / CELL);
    const grid = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r * cols + c] = predict(c * CELL + CELL / 2, r * CELL + CELL / 2);
      }
    }
    return { grid, cols, metrics: evaluate(points, predict) };
  }, [points, algo, k, metric, learningRate, epochs, smoothing]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    if (result) {
      const img = ctx.createImageData(W, H);
      for (let y = 0; y < H; y++) {
        const row = Math.floor(y / CELL) * result.cols;
        for (let x = 0; x < W; x++) {
          const rgb = CLASS_RGB[result.grid[row + Math.floor(x / CELL)]];
          const i = (y * W + x) * 4;
          img.data[i] = rgb[0];
          img.data[i + 1] = rgb[1];
          img.data[i + 2] = rgb[2];
          img.data[i + 3] = 46;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < W; x += 40) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = 40; y < H; y += 40) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();

    for (const p of points) {
      const [r, g, b] = CLASS_RGB[p.c];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(2,2,3,0.85)";
      ctx.stroke();
    }
  }, [points, result]);

  function addPoint(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * W) / rect.width;
    const y = ((e.clientY - rect.top) * H) / rect.height;
    setPoints((prev) => [...prev, { x, y, c: klass }]);
  }

  const m = result?.metrics;
  const countA = points.filter((p) => p.c === 0).length;
  const pct = (v: number | undefined) =>
    v === undefined ? "–" : `${(v * 100).toFixed(1)}%`;
  const activeAlgo = ALGOS.find((a) => a.id === algo)!;

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)_14rem]">
      {/* ---- controls ---- */}
      <div className="glass space-y-5 p-5">
        <label className="block">
          <span className="text-xs text-ink2">Classifier</span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm"
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
          >
            {ALGOS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-relaxed text-ink2">{activeAlgo.note}</p>

        {algo === "knn" && (
          <>
            <Slider label="K" value={k} min={1} max={25} step={2} onChange={setK} />
            <label className="block">
              <span className="text-xs text-ink2">Distance</span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm"
                value={metric}
                onChange={(e) => setMetric(e.target.value as DistanceMetric)}
              >
                <option value="euclidean">Euclidean</option>
                <option value="manhattan">Manhattan</option>
              </select>
            </label>
          </>
        )}
        {algo === "perceptron" && (
          <>
            <Slider
              label="Learning rate"
              value={learningRate}
              min={0.01}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={setLearningRate}
            />
            <Slider
              label="Epochs"
              value={epochs}
              min={1}
              max={200}
              step={1}
              onChange={setEpochs}
            />
          </>
        )}
        {algo === "nb" && (
          <Slider
            label="Variance smoothing"
            value={smoothing}
            min={0}
            max={2000}
            step={50}
            onChange={setSmoothing}
          />
        )}

        <div>
          <span className="text-xs text-ink2">Load a dataset</span>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {DATASETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setPoints(makeDataset(d, W, H))}
                className="h-10 rounded-lg border border-line text-xs capitalize hover:bg-surface-hover"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="text-xs text-ink2">Click adds a point of</legend>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {([0, 1] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={klass === c}
                onClick={() => setKlass(c)}
                className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs ${
                  klass === c
                    ? "border-line-strong bg-surface-hover text-ink"
                    : "border-line text-ink2"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${c === 0 ? "bg-ok" : "bg-bad"}`}
                />
                Class {c === 0 ? "A" : "B"}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setPoints([])}
          disabled={points.length === 0}
          className="h-10 w-full rounded-lg border border-line text-xs text-ink2 hover:bg-surface-hover disabled:opacity-40"
        >
          Clear points
        </button>
      </div>

      {/* ---- canvas ---- */}
      <div className="glass relative self-start overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={addPoint}
          onContextMenu={(e) => {
            e.preventDefault();
            setKlass((c) => (c === 0 ? 1 : 0));
          }}
          className="block h-auto w-full cursor-crosshair"
          role="img"
          aria-label={`Scatter plot with ${countA} class A points and ${
            points.length - countA
          } class B points${result ? ", shaded by predicted class" : ""}.`}
        />
        {points.length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink2">
            Click to place points, or load a dataset.
            <br />
            Right-click switches class.
          </p>
        )}
      </div>

      {/* ---- metrics ---- */}
      <div className="glass space-y-4 p-5" aria-live="polite">
        <p className="text-xs text-ink2">Fit on the points shown</p>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {[
            ["Accuracy", pct(m?.accuracy)],
            ["Precision", pct(m?.precision)],
            ["Recall", pct(m?.recall)],
            ["F1", m ? m.f1.toFixed(3) : "–"],
          ].map(([label, value]) => (
            <div key={label}>
              <dd className="font-mono text-2xl font-medium tabular-nums">
                {value}
              </dd>
              <dt className="text-xs text-ink2">{label}</dt>
            </div>
          ))}
        </dl>

        <div className="border-t border-line pt-4">
          <p className="text-xs text-ink2">Confusion matrix (B is positive)</p>
          <dl className="mt-2 grid grid-cols-2 gap-1.5 text-center">
            {[
              ["TP", m?.tp],
              ["FP", m?.fp],
              ["FN", m?.fn],
              ["TN", m?.tn],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-line py-2">
                <dd className="font-mono text-lg tabular-nums">{value ?? 0}</dd>
                <dt className="text-[0.65rem] text-ink3">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <p className="border-t border-line pt-4 font-mono text-xs text-ink2">
          <span className="text-ok">●</span> A: {countA}{" "}
          <span className="ml-3 text-bad">●</span> B: {points.length - countA}
        </p>
        <p className="text-xs leading-relaxed text-ink3">
          Scores are computed on the training points, so they flatter flexible
          models. KNN with K = 1 always reads 100%.
        </p>
      </div>
    </div>
  );
}
