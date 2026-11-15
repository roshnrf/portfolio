import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass glass-hover group flex flex-col p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="label">{project.tagline}</span>
        <span className="font-mono text-xs text-ink3">{project.year}</span>
      </div>

      <h3 className="mt-3 text-xl font-semibold tracking-tight">
        {project.title}
      </h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink2">
        {project.summary}
      </p>

      {project.metrics.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
          {project.metrics.slice(0, 2).map((m) => (
            <div key={m.label}>
              <dd className="font-mono text-lg font-medium text-ok">
                {m.value}
              </dd>
              <dt className="mt-0.5 text-xs leading-snug text-ink3">
                {m.label}
              </dt>
            </div>
          ))}
        </dl>
      )}

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 5).map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>

      <span className="mt-5 text-sm font-medium text-accent-soft">
        Read the write-up{" "}
        <span
          aria-hidden="true"
          className="inline-block transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
