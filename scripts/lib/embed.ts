// Embedding model used at build time. The browser loads the same model and
// the same quantisation (see public/embed-worker.js), so vectors are comparable.
import { pipeline } from "@huggingface/transformers";

export const MODEL = "Xenova/all-MiniLM-L6-v2";
export const DTYPE = "q8";

type Extractor = (
  texts: string[],
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ tolist(): number[][] }>;

let extractor: Promise<Extractor> | undefined;

export async function embed(texts: string[]): Promise<number[][]> {
  extractor ??= pipeline("feature-extraction", MODEL, {
    dtype: DTYPE,
  }) as unknown as Promise<Extractor>;
  const run = await extractor;
  const vectors: number[][] = [];
  // Small batches keep memory flat on the build machine.
  for (let i = 0; i < texts.length; i += 16) {
    const out = await run(texts.slice(i, i + 16), {
      pooling: "mean",
      normalize: true,
    });
    vectors.push(...out.tolist());
  }
  return vectors;
}
