import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile, site } from "@/data/profile";
import { getProject, getProjects } from "@/lib/content";
import { jsonLd } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

// Only the slugs in /content/projects exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];

  return (
    <article className="mx-auto max-w-3xl pb-8 pt-12 sm:pt-16">
      <Link href="/#projects" className="text-sm text-ink2 hover:text-ink">
        <span aria-hidden="true">←</span> All projects
      </Link>

      <header className="mt-8">
        <p className="label">
          {project.tagline} · {project.year}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink2">
          {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
            >
              Live demo <span aria-hidden="true">↗</span>
            </a>
          )}
          <a href={project.repo} target="_blank" rel="noopener" className="btn">
            Source on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        {project.status && (
          <p className="mt-4 text-sm text-ink3">{project.status}</p>
        )}
      </header>

      {project.metrics.length > 0 && (
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {project.metrics.map((m) => (
            <div key={m.label} className="glass p-4">
              <dd className="font-mono text-xl font-medium text-ok">
                {m.value}
              </dd>
              <dt className="mt-1 text-xs leading-snug text-ink2">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}

      <ul className="mt-6 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>

      <div
        className="prose-md mt-10"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: project.title,
            description: project.summary,
            url: `${site.url}/projects/${project.slug}`,
            codeRepository: project.repo,
            keywords: project.tags.join(", "),
            author: { "@type": "Person", name: profile.name, url: site.url },
          }),
        }}
      />

      <footer className="mt-16 border-t border-line pt-8">
        <p className="text-sm text-ink3">Next project</p>
        <Link
          href={`/projects/${next.slug}`}
          className="mt-1 inline-block text-xl font-semibold hover:text-accent-soft"
        >
          {next.title} <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </article>
  );
}
