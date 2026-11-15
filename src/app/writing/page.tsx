import type { Metadata } from "next";
import Link from "next/link";
import { externalPosts } from "@/data/profile";
import { formatDate, getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description: "Project breakdowns and notes on building ML systems.",
};

export default function WritingPage() {
  const local = getPosts().map((p) => ({
    title: p.title,
    date: p.date,
    summary: p.summary,
    href: `/writing/${p.slug}`,
    external: false,
  }));
  const posts = [
    ...local,
    ...externalPosts.map((p) => ({ ...p, external: true })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl pb-8 pt-12 sm:pt-16">
      <p className="label">writing</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Writing
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink2">
        Project breakdowns and lessons from building things.
      </p>

      <ul className="mt-12 space-y-4">
        {posts.map((p) => {
          const body = (
            <>
              <p className="font-mono text-xs text-ink3">
                {formatDate(p.date)}
                {p.external && " · on Medium"}
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight">
                {p.title}{" "}
                {p.external && (
                  <span aria-hidden="true" className="text-ink3">
                    ↗
                  </span>
                )}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink2">
                {p.summary}
              </p>
            </>
          );
          return (
            <li key={p.href}>
              {p.external ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="glass glass-hover block p-6"
                >
                  {body}
                </a>
              ) : (
                <Link href={p.href} className="glass glass-hover block p-6">
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
