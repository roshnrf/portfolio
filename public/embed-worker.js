// Embeds a visitor's question in their own browser. Nothing is sent to a server:
// the model is downloaded once from the Hugging Face CDN and cached.
//
// Must stay in step with scripts/lib/embed.ts (same library version, model and
// quantisation), otherwise query vectors and index vectors are not comparable.
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2";

const MODEL = "Xenova/all-MiniLM-L6-v2";
let extractor;

function load() {
  extractor ??= pipeline("feature-extraction", MODEL, {
    dtype: "q8",
    progress_callback: (p) => {
      if (p.status === "progress" && String(p.file).endsWith(".onnx")) {
        self.postMessage({ type: "progress", progress: Math.round(p.progress) });
      }
    },
  });
  return extractor;
}

self.onmessage = async (event) => {
  const { type, id, text } = event.data;
  try {
    const run = await load();
    if (type === "load") {
      self.postMessage({ type: "ready" });
      return;
    }
    const output = await run([text], { pooling: "mean", normalize: true });
    self.postMessage({ type: "vector", id, vector: Array.from(output.data) });
  } catch (error) {
    self.postMessage({ type: "error", id, message: String(error) });
  }
};
