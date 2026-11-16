// Text helpers shared by the index builder (Node) and the search UI (browser).
// No Node or DOM APIs here.

const STOP_WORDS = new Set(
  (
    "a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it its " +
    "me my of on or our she so than that the their them then there these they this to was we were what when where which " +
    "who whom why will with would you your yours about tell any some much many more most very just also " +
    // Generic words that match almost any page and say nothing about the topic.
    "time old today now good best like get thing"
  ).split(" "),
);

/** "Calibrating the gate" -> "calibrating-the-gate" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** One or more consecutive lines that start and end with a pipe. */
const TABLE = /(?:^[ \t]*\|.*\|[ \t]*$\n?)+/gm;
const SEPARATOR_ROW = /^[\s:|-]+$/;

/**
 * A Markdown table becomes one sentence, "Model: Accuracy; Stock: 80%; Tuned: 96%.",
 * so the header and its numbers stay together when a passage is quoted.
 */
function tableToSentence(table: string): string {
  const rows = table
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !SEPARATOR_ROW.test(line))
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
        .join(": "),
    );
  return rows.join("; ") + ".\n";
}

/** Reduce Markdown to plain prose. Code blocks and media are dropped. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\r\n/g, "\n")
    .replace(TABLE, tableToSentence)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

/** Very light stemmer: enough to match "built"/"build" and plurals. */
function stem(word: string): string {
  if (word === "built") return "build";
  if (word === "accurate" || word === "accurately") return "accuracy";
  // studies, studied -> study
  if (word.length > 4 && /ie[sd]$/.test(word)) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

/** Lower-cased content words, stop words removed, stemmed. */
export function tokenize(text: string): string[] {
  // \p{M} keeps combining marks attached, so Devanagari words stay whole.
  const words = text.toLowerCase().match(/[\p{L}\p{N}\p{M}]+/gu) ?? [];
  return words.filter((w) => !STOP_WORDS.has(w)).map(stem);
}

/** Split prose into sentences without breaking on decimals like "0.38". */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
