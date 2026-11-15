// Builds public/search-index.json: every passage on the site plus its embedding.
// Runs before `next build` (see "prebuild" in package.json).
import fs from "node:fs";
import path from "node:path";
import { chunkDoc, embedText } from "../src/lib/search/chunk";
import { collectDocs } from "./lib/docs";
import { DTYPE, embed, MODEL } from "./lib/embed";

const OUT = path.join(process.cwd(), "public", "search-index.json");

async function main() {
  const chunks = collectDocs().flatMap((doc) => chunkDoc(doc));
  const vectors = await embed(chunks.map(embedText));

  const index = {
    model: MODEL,
    dtype: DTYPE,
    dim: vectors[0].length,
    chunks,
    // Four decimals is plenty for cosine ranking and keeps the file small.
    vectors: vectors.map((v) => v.map((x) => Math.round(x * 1e4) / 1e4)),
  };

  fs.writeFileSync(OUT, JSON.stringify(index));
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(
    `search index: ${chunks.length} passages from ${new Set(chunks.map((c) => c.source)).size} sources, ${kb} KB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
