import Link from "next/link";
import { Ask } from "@/components/Ask";
import { ProjectCard } from "@/components/ProjectCard";
import { Story } from "@/components/Story";
import {
  otherProjects,
  profile,
  site,
  skills,
  timeline,
} from "@/data/profile";
import { formatDate, getProjects, getUpdates } from "@/lib/content";
import { jsonLd } from "@/lib/jsonld";

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="label">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  const projects = getProjects();
  const updates = getUpdates().slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            url: site.url,
            description: site.description,
            email: `mailto:${profile.email}`,
            jobTitle: "MSc Data Science student",
            affiliation: { "@type": "CollegeOrUniversity", name: "TU Dortmund University" },
            alumniOf: { "@type": "CollegeOrUniversity", name: "Vellore Institute of Technology, Chennai" },
            address: { "@type": "PostalAddress", addressLocality: "Dortmund", addressCountry: "DE" },
            sameAs: [profile.links.github, profile.links.linkedin, profile.links.medium],
          }),
        }}
      />

      {/* ---------- Hero ---------- */}
      <section className="pb-16 pt-16 sm:pt-24">
        <p className="label">{profile.eyebrow}</p>
        <h1 className="mt-4 text-[clamp(2.1rem,5.2vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          {profile.name}
        </h1>
        <p className="headline mt-3 max-w-3xl text-[clamp(1.5rem,3.6vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
          {profile.headline}
        </p>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink2">
          {profile.intro}
        </p>

        <div className="mt-8">
          <Ask />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm text-ink2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-ok"
            />
            {profile.availability}
          </p>
          <a
            href={profile.links.resume}
            target="_blank"
            rel="noopener"
            className="btn"
          >
            Resume (PDF)
          </a>
          <Link href="/#contact" className="btn">
            Contact
          </Link>
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section id="about" className="py-10">
        <SectionHeading label="01 / the work" title="Five things I built, and what each one taught me" />
        <Story />
      </section>

      {/* ---------- Projects ---------- */}
      <section id="projects" className="py-16">
        <SectionHeading label="02 / projects" title="All write-ups" />
        <div className="grid gap-5 md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <h3 className="mb-4 mt-12 text-sm font-medium text-ink2">
          Smaller builds
        </h3>
        <ul className="grid gap-4 md:grid-cols-2">
          {otherProjects.map((p) => (
            <li key={p.title}>
              <a
                href={p.href}
                className="glass glass-hover block h-full p-5"
                target="_blank"
                rel="noopener"
              >
                <h4 className="font-semibold">
                  {p.title}{" "}
                  <span aria-hidden="true" className="text-ink3">
                    ↗
                  </span>
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink2">
                  {p.body}
                </p>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Journey ---------- */}
      <section id="journey" className="py-16">
        <SectionHeading label="03 / journey" title="Education and experience" />
        <ol className="space-y-8 border-l border-line pl-6 sm:pl-8">
          {timeline.map((t) => (
            <li key={t.title + t.org} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[1.83rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg sm:-left-[2.33rem] ${
                  t.kind === "Education" ? "bg-accent-soft" : "bg-ok"
                }`}
              />
              <p className="font-mono text-xs text-ink3">
                {t.period} · {t.kind}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{t.title}</h3>
              <p className="text-sm text-ink2">{t.org}</p>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-ink2">
                {t.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Skills ---------- */}
      <section id="skills" className="py-16">
        <SectionHeading label="04 / skills" title="Tools I reach for" />
        <div className="grid gap-5 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.group} className="glass p-5">
              <h3 className="text-sm font-semibold">{s.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.items.map((i) => (
                  <li key={i} className="chip">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Updates ---------- */}
      <section id="updates" className="py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading label="05 / updates" title="Latest" />
          <Link href="/updates" className="link mb-9 text-sm">
            All updates
          </Link>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {updates.map((u) => (
            <li key={u.slug}>
              <Link
                href={`/updates#${u.slug}`}
                className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <time
                  dateTime={u.date}
                  className="w-24 shrink-0 font-mono text-xs text-ink3"
                >
                  {formatDate(u.date)}
                </time>
                <span className="font-medium group-hover:text-accent-soft">
                  {u.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="py-16">
        <div className="glass p-8 sm:p-10">
          <p className="label">06 / contact</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Get in touch
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-ink2">
            Email is the fastest way to reach me. I am happy to talk about
            working student roles, internships, speech and voice AI, or
            anything on this page.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-primary">
              {profile.email}
            </a>
            <a href={profile.links.linkedin} className="btn">
              LinkedIn
            </a>
            <a href={profile.links.github} className="btn">
              GitHub
            </a>
            <a href={profile.links.medium} className="btn">
              Medium
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
