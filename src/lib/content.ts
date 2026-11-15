import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.join(process.cwd(), "content");

export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  year: string;
  order: number;
  status?: string;
  tags: string[];
  metrics: Metric[];
  repo: string;
  demo?: string;
  html: string;
};

export type Update = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  html: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readingTime: string;
  html: string;
};

function render(markdown: string): string {
  const html = marked.parse(markdown, { async: false, gfm: true });
  // Wide tables scroll inside their own box instead of the page.
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<img /g, '<img loading="lazy" decoding="async" ');
}

function readDir(dir: string) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.md$/, ""), data, html: render(content) };
    });
}

/** Frontmatter dates may parse as Date objects; normalise to YYYY-MM-DD. */
function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

export function getProjects(): Project[] {
  return readDir("projects")
    .map(({ slug, data, html }) => ({
      slug,
      title: String(data.title),
      tagline: String(data.tagline ?? ""),
      summary: String(data.summary ?? ""),
      year: String(data.year ?? ""),
      order: Number(data.order ?? 99),
      status: data.status ? String(data.status) : undefined,
      tags: (data.tags ?? []) as string[],
      metrics: (data.metrics ?? []) as Metric[],
      repo: String(data.repo ?? ""),
      demo: data.demo ? String(data.demo) : undefined,
      html,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getUpdates(): Update[] {
  return readDir("updates")
    .map(({ slug, data, html }) => ({
      slug,
      title: String(data.title),
      date: isoDate(data.date),
      tags: (data.tags ?? []) as string[],
      html,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPosts(): Post[] {
  return readDir("writing")
    .map(({ slug, data, html }) => ({
      slug,
      title: String(data.title),
      date: isoDate(data.date),
      summary: String(data.summary ?? ""),
      readingTime: String(data.readingTime ?? ""),
      html,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-10-01" -> "Oct 2026" (day omitted when dayPrecision is false). */
export function formatDate(iso: string, dayPrecision = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[(m || 1) - 1];
  return dayPrecision ? `${d} ${month} ${y}` : `${month} ${y}`;
}
