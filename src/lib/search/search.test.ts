import { describe, expect, it } from "vitest";
import { chunkDoc, embedText, type Chunk, type Doc } from "./chunk";
import {
  bestSentence,
  bySource,
  decide,
  dot,
  hybridScores,
  keywordScores,
  semanticScores,
  topHits,
} from "./rank";
import { slugify, splitSentences, stripMarkdown, tokenize } from "./text";

describe("slugify", () => {
  it("makes URL-safe anchors", () => {
    expect(slugify("Calibrating the gate")).toBe("calibrating-the-gate");
    expect(slugify("  What I'd add — next! ")).toBe("what-i-d-add-next");
  });
  it("ignores inline HTML", () => {
    expect(slugify("The <code>gate</code>")).toBe("the-gate");
  });
});

describe("stripMarkdown", () => {
  it("removes formatting but keeps the words", () => {
    expect(stripMarkdown("**Bold** and [a link](/x) with `code`.")).toBe(
      "Bold and a link with code.",
    );
  });
  it("drops code fences, images and HTML", () => {
    const md = "Before\n```\nsecret()\n```\n![alt](/a.png)\n<video src='x'></video>\nAfter";
    const out = stripMarkdown(md);
    expect(out).not.toContain("secret");
    expect(out).not.toContain("alt");
    expect(out).toContain("Before");
    expect(out).toContain("After");
  });
  it("turns table rows into sentences and drops the separator", () => {
    const md = "| Detector | Weight |\n| --- | --- |\n| Isolation Forest | 0.50 |";
    expect(stripMarkdown(md)).toBe("Detector: Weight.\nIsolation Forest: 0.50.");
  });
  it("strips list markers and headings", () => {
    expect(stripMarkdown("## Title\n- one\n2. two")).toBe("Title\none\ntwo");
  });
});

describe("tokenize", () => {
  it("drops stop words and lower-cases", () => {
    expect(tokenize("What is the ROC-AUC of PIRS?")).toEqual(["roc", "auc", "pir"]);
  });
  it("matches build and built", () => {
    expect(tokenize("built")).toEqual(tokenize("build"));
  });
  it("keeps numbers and non-Latin letters", () => {
    expect(tokenize("0.38 हिंदी")).toEqual(["0", "38", "हिंदी"]);
  });
  it("returns nothing for stop words only", () => {
    expect(tokenize("what is your")).toEqual([]);
  });
});

describe("splitSentences", () => {
  it("does not split on decimals", () => {
    expect(splitSentences("The gate is 0.38. It was calibrated.")).toEqual([
      "The gate is 0.38.",
      "It was calibrated.",
    ]);
  });
  it("splits on newlines", () => {
    expect(splitSentences("one\ntwo")).toEqual(["one", "two"]);
  });
});

const doc: Doc = {
  url: "/projects/demo",
  title: "Demo",
  kind: "project",
  markdown: "Intro text.\n\n## The problem\n\nFirst.\n\n## Results\n\nSecond.\n\n```\n## not a heading\n```",
};

describe("chunkDoc", () => {
  const chunks = chunkDoc(doc);
  it("splits on level-2 headings", () => {
    expect(chunks.map((c) => c.heading)).toEqual(["", "The problem", "Results"]);
  });
  it("links each chunk to its heading anchor", () => {
    expect(chunks.map((c) => c.url)).toEqual([
      "/projects/demo",
      "/projects/demo#the-problem",
      "/projects/demo#results",
    ]);
  });
  it("ignores headings inside code fences", () => {
    expect(chunks).toHaveLength(3);
  });
  it("keeps an existing anchor instead of adding another", () => {
    const [chunk] = chunkDoc({ ...doc, url: "/#about", markdown: "## H\n\nBody." });
    expect(chunk.url).toBe("/#about");
  });
  it("splits long sections by paragraph", () => {
    const long = chunkDoc(
      { ...doc, markdown: `${"a".repeat(60)}\n\n${"b".repeat(60)}` },
      100,
    );
    expect(long).toHaveLength(2);
  });
  it("gives every chunk a unique id", () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });
  it("skips empty documents", () => {
    expect(chunkDoc({ ...doc, markdown: "\n\n" })).toEqual([]);
  });
  it("embeds title and heading with the text", () => {
    expect(embedText(chunks[1])).toBe("Demo. The problem. First.");
  });
});

const chunk = (source: string, text: string): Chunk => ({
  id: source + text,
  url: `/${source}`,
  source,
  kind: "project",
  heading: "",
  text,
});

describe("ranking", () => {
  const chunks = [
    chunk("A", "Whisper fine-tuning for child speech"),
    chunk("A", "Phoneme scoring and alignment"),
    chunk("B", "Insider threat detection with an LSTM autoencoder"),
  ];

  it("dot product of normalised vectors is cosine similarity", () => {
    expect(dot([1, 0], [1, 0])).toBe(1);
    expect(dot([1, 0], [0, 1])).toBe(0);
  });

  it("scores every vector against the query", () => {
    expect(semanticScores([1, 0], [[1, 0], [0, 1], [0.6, 0.8]])).toEqual([1, 0, 0.6]);
  });

  it("orders hits by score", () => {
    const hits = topHits([0.2, 0.9, 0.5], chunks, 2);
    expect(hits.map((h) => h.score)).toEqual([0.9, 0.5]);
    expect(hits[0].chunk.text).toContain("Phoneme");
  });

  it("keeps the best score per source", () => {
    expect(bySource([0.2, 0.9, 0.5], chunks)).toEqual([
      { source: "A", url: "/A", score: 0.9 },
      { source: "B", url: "/B", score: 0.5 },
    ]);
  });

  it("keyword scores find the matching passage", () => {
    const scores = keywordScores("insider threat", chunks.map((c) => c.text));
    expect(scores.indexOf(Math.max(...scores))).toBe(2);
    expect(scores[2]).toBe(1);
  });

  it("keyword scores drop when part of the query is missing", () => {
    const scores = keywordScores("insider pizza", chunks.map((c) => c.text));
    expect(scores[2]).toBeGreaterThan(0);
    expect(scores[2]).toBeLessThan(0.5);
  });

  it("a missing rare word costs more than a missing common one", () => {
    const texts = ["speech model", "speech data", "speech drdo"];
    const missingCommon = keywordScores("drdo speech", ["drdo only", ...texts])[0];
    const missingRare = keywordScores("drdo speech", ["speech only", ...texts.slice(0, 2), "drdo x"])[0];
    expect(missingCommon).toBeGreaterThan(missingRare);
  });

  it("hybrid score adds the keyword bonus to semantic similarity", () => {
    expect(hybridScores("q", [0.4, 0.4, 0.4], [1, 0, 0], chunks, 0.35)).toEqual([0.75, 0.4, 0.4]);
  });

  it("hybrid score favours a page named in the question", () => {
    const named = [chunk("ArticuPlay", "x"), chunk("StoryWeaver", "mentions ArticuPlay")];
    const scores = hybridScores("What is ArticuPlay?", [0.5, 0.5], [0, 0], named);
    expect(scores[0]).toBeGreaterThan(scores[1]);
  });

  it("hybrid score ranks dated posts below canonical pages", () => {
    const mixed = [chunk("A", "x"), { ...chunk("B", "x"), kind: "post" as const }];
    const scores = hybridScores("q", [0.5, 0.5], [0, 0], mixed);
    expect(scores[0]).toBeGreaterThan(scores[1]);
  });

  it("keyword scores are zero when nothing matches", () => {
    expect(keywordScores("favourite food", chunks.map((c) => c.text))).toEqual([0, 0, 0]);
    expect(keywordScores("what is the", chunks.map((c) => c.text))).toEqual([0, 0, 0]);
  });
});

describe("decide", () => {
  it("answers at or above the threshold and refuses below it", () => {
    expect(decide(0.38, 0.38)).toBe("answer");
    expect(decide(0.5, 0.38)).toBe("answer");
    expect(decide(0.379, 0.38)).toBe("refuse");
  });
});

describe("bestSentence", () => {
  const text = "PIRS has nine layers. The ROC-AUC on CERT is 0.8973. It was a capstone.";
  it("picks the sentence sharing the most words with the query", () => {
    const { sentences, index } = bestSentence("What ROC-AUC did it reach on CERT?", text);
    expect(sentences[index]).toBe("The ROC-AUC on CERT is 0.8973.");
  });
  it("falls back to the first sentence", () => {
    expect(bestSentence("zzz", text).index).toBe(0);
  });
});
