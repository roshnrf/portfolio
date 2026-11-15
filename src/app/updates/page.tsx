import type { Metadata } from "next";
import { formatDate, getUpdates } from "@/lib/content";

export const metadata: Metadata = {
  title: "Updates",
  description: "What Roshan is working on, studying and shipping.",
};

export default function UpdatesPage() {
  const updates = getUpdates();

  return (
    <div className="mx-auto max-w-3xl pb-8 pt-12 sm:pt-16">
      <p className="label">updates</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        What I am up to
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink2">
        Short notes on studies, projects and things I shipped. Newest first.
      </p>

      <ol className="mt-12 space-y-6">
        {updates.map((u) => (
          <li key={u.slug} id={u.slug} className="glass p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <time dateTime={u.date} className="font-mono text-xs text-ink3">
                {formatDate(u.date, true)}
              </time>
              {u.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              {u.title}
            </h2>
            <div
              className="prose-md mt-3"
              dangerouslySetInnerHTML={{ __html: u.html }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
