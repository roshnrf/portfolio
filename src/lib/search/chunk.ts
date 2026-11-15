import { slugify, stripMarkdown } from "./text";

export type DocKind = "project" | "post" | "update" | "profile";

/** One page (or one profile section) before it is split up. */
export type Doc = {
  url: string;
  title: string;
  kind: DocKind;
  markdown: string;
};

/** One retrievable passage. */
export type Chunk = {
  id: string;
  url: string;
  source: string;
  kind: DocKind;
  heading: string;
  text: string;
};

const MAX_CHARS = 900;

/** Group paragraphs into pieces no longer than `maxChars`. */
function packParagraphs(text: string, maxChars: number): string[] {
  const pieces: string[] = [];
  let current = "";
  for (const paragraph of text.split("\n")) {
    if (current && current.length + paragraph.length + 1 > maxChars) {
      pieces.push(current);
      current = "";
    }
    current = current ? `${current} ${paragraph}` : paragraph;
  }
  if (current) pieces.push(current);
  return pieces;
}

/** Split a document on its `##` headings, then by length. */
export function chunkDoc(doc: Doc, maxChars = MAX_CHARS): Chunk[] {
  const sections: { heading: string; body: string }[] = [];
  let heading = "";
  let lines: string[] = [];
  const flush = () => {
    const body = stripMarkdown(lines.join("\n"));
    if (body) sections.push({ heading, body });
    lines = [];
  };
  let inFence = false;
  for (const line of doc.markdown.split(/\r?\n/)) {
    if (line.startsWith("```")) inFence = !inFence;
    const match = !inFence && /^##\s+(.*)$/.exec(line);
    if (match) {
      flush();
      heading = match[1].trim();
    } else {
      lines.push(line);
    }
  }
  flush();

  const chunks: Chunk[] = [];
  for (const section of sections) {
    const anchor = section.heading ? `#${slugify(section.heading)}` : "";
    const url = doc.url.includes("#") ? doc.url : `${doc.url}${anchor}`;
    for (const text of packParagraphs(section.body, maxChars)) {
      chunks.push({
        id: `${doc.url}::${chunks.length}`,
        url,
        source: doc.title,
        kind: doc.kind,
        heading: section.heading,
        text,
      });
    }
  }
  return chunks;
}

/** The string that gets embedded: title and heading give short passages context. */
export function embedText(chunk: Chunk): string {
  return [chunk.source, chunk.heading, chunk.text].filter(Boolean).join(". ");
}
