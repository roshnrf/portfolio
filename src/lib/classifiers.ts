// Tiny from-scratch classifiers for the playground. Pure functions, no DOM.

export type Point = { x: number; y: number; c: 0 | 1 };
export type Algo = "knn" | "perceptron" | "nb";
export type DistanceMetric = "euclidean" | "manhattan";

export type Params = {
  k: number;
  metric: DistanceMetric;
  learningRate: number;
  epochs: number;
  smoothing: number;
};

export type Predictor = (x: number, y: number) => 0 | 1;

function knn(points: Point[], k: number, metric: DistanceMetric): Predictor {
  return (px, py) => {
    const dists = points.map((p) => ({
      d:
        metric === "manhattan"
          ? Math.abs(p.x - px) + Math.abs(p.y - py)
          : Math.hypot(p.x - px, p.y - py),
      c: p.c,
    }));
    dists.sort((a, b) => a.d - b.d);
    let votesB = 0;
    const n = Math.min(k, dists.length);
    for (let i = 0; i < n; i++) votesB += dists[i].c;
    return votesB > n - votesB ? 1 : 0;
  };
}

function perceptron(points: Point[], lr: number, epochs: number): Predictor {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const rangeX = Math.max(...xs) - minX || 1;
  const rangeY = Math.max(...ys) - minY || 1;

  // w[0] is the bias. Small random init.
  const w = [0, 1, 2].map(() => Math.random() * 0.4 - 0.2);
  for (let e = 0; e < epochs; e++) {
    for (const p of points) {
      const nx = (p.x - minX) / rangeX;
      const ny = (p.y - minY) / rangeY;
      const pred = w[0] + w[1] * nx + w[2] * ny > 0 ? 1 : 0;
      const err = p.c - pred;
      w[0] += lr * err;
      w[1] += lr * err * nx;
      w[2] += lr * err * ny;
    }
  }
  return (px, py) =>
    w[0] + (w[1] * (px - minX)) / rangeX + (w[2] * (py - minY)) / rangeY > 0
      ? 1
      : 0;
}

function naiveBayes(points: Point[], smoothing: number): Predictor {
  const stats = ([0, 1] as const).map((c) => {
    const pts = points.filter((p) => p.c === c);
    const n = pts.length;
    const meanX = pts.reduce((a, p) => a + p.x, 0) / n;
    const meanY = pts.reduce((a, p) => a + p.y, 0) / n;
    const varX = pts.reduce((a, p) => a + (p.x - meanX) ** 2, 0) / n + smoothing;
    const varY = pts.reduce((a, p) => a + (p.y - meanY) ** 2, 0) / n + smoothing;
    return { meanX, meanY, varX, varY, logPrior: Math.log(n / points.length) };
  });
  const score = (s: (typeof stats)[number], px: number, py: number) =>
    s.logPrior -
    0.5 * Math.log(2 * Math.PI * s.varX) -
    (px - s.meanX) ** 2 / (2 * s.varX) -
    0.5 * Math.log(2 * Math.PI * s.varY) -
    (py - s.meanY) ** 2 / (2 * s.varY);
  return (px, py) => (score(stats[1], px, py) > score(stats[0], px, py) ? 1 : 0);
}

/** Returns null unless both classes are present. */
export function train(points: Point[], algo: Algo, p: Params): Predictor | null {
  const hasA = points.some((pt) => pt.c === 0);
  const hasB = points.some((pt) => pt.c === 1);
  if (!hasA || !hasB) return null;
  if (algo === "knn") return knn(points, p.k, p.metric);
  if (algo === "perceptron") return perceptron(points, p.learningRate, p.epochs);
  return naiveBayes(points, p.smoothing);
}

export type Metrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
};

/** Scored on the training points themselves (class B is the positive class). */
export function evaluate(points: Point[], predict: Predictor): Metrics {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const p of points) {
    const pred = predict(p.x, p.y);
    if (p.c === 1 && pred === 1) tp++;
    else if (p.c === 0 && pred === 1) fp++;
    else if (p.c === 1 && pred === 0) fn++;
    else tn++;
  }
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  return {
    accuracy: (tp + tn) / points.length,
    precision,
    recall,
    f1: precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0,
    tp, fp, fn, tn,
  };
}

export type DatasetName = "blobs" | "circles" | "moons" | "xor" | "spiral" | "linear";

export function makeDataset(type: DatasetName, W: number, H: number): Point[] {
  const pts: Point[] = [];
  const cx = W / 2, cy = H / 2;
  const n = 80;
  const r = Math.random;
  const jitter = (s: number) => (r() - 0.5) * s;

  switch (type) {
    case "blobs":
      for (let i = 0; i < n; i++) {
        pts.push({ x: 180 + r() * 120, y: 160 + r() * 120, c: 0 });
        pts.push({ x: 360 + r() * 120, y: 280 + r() * 120, c: 1 });
      }
      break;
    case "circles":
      for (let i = 0; i < n; i++) {
        const a1 = r() * Math.PI * 2, r1 = 60 + r() * 30;
        pts.push({ x: cx + Math.cos(a1) * r1, y: cy + Math.sin(a1) * r1, c: 0 });
        const a2 = r() * Math.PI * 2, r2 = 140 + r() * 40;
        pts.push({ x: cx + Math.cos(a2) * r2, y: cy + Math.sin(a2) * r2, c: 1 });
      }
      break;
    case "moons":
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * i) / n;
        pts.push({ x: cx - 65 + Math.cos(a) * 130 + jitter(30), y: cy + 20 - Math.sin(a) * 130 + jitter(30), c: 0 });
        pts.push({ x: cx + 65 - Math.cos(a) * 130 + jitter(30), y: cy - 20 + Math.sin(a) * 130 + jitter(30), c: 1 });
      }
      break;
    case "xor":
      for (let i = 0; i < n; i++) {
        pts.push({ x: 120 + r() * 160, y: 100 + r() * 140, c: 0 });
        pts.push({ x: 380 + r() * 160, y: 300 + r() * 140, c: 0 });
        pts.push({ x: 380 + r() * 160, y: 100 + r() * 140, c: 1 });
        pts.push({ x: 120 + r() * 160, y: 300 + r() * 140, c: 1 });
      }
      break;
    case "spiral":
      for (let i = 0; i < n * 2; i++) {
        const t = (i / n) * 3, rad = 20 + t * 35;
        pts.push({ x: cx + Math.cos(t) * rad + jitter(20), y: cy + Math.sin(t) * rad + jitter(20), c: 0 });
        pts.push({ x: cx - Math.cos(t) * rad + jitter(20), y: cy - Math.sin(t) * rad + jitter(20), c: 1 });
      }
      break;
    case "linear":
      for (let i = 0; i < n * 2; i++) {
        const x = r() * W, y = r() * H;
        pts.push({ x, y, c: y < H - (x * H) / W + jitter(80) ? 0 : 1 });
      }
      break;
  }
  return pts;
}
