// /llms.txt: a plain-text summary of the site for language models and
// tools that read pages on someone's behalf. Generated from the same data
// the pages use, so it cannot drift.
import { profile, site, timeline } from "@/data/profile";
import { getPosts, getProjects } from "@/lib/content";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${site.description}`,
    "",
    `${profile.eyebrow}. ${profile.availability}. Based in ${profile.location}.`,
    "",
    "## Projects",
    ...getProjects().map(
      (p) => `- [${p.title}](${site.url}/projects/${p.slug}): ${p.summary}`,
    ),
    "",
    "## Education and experience",
    ...timeline.map((t) => `- ${t.period}: ${t.title}, ${t.org}`),
    "",
    "## Writing",
    ...getPosts().map(
      (p) => `- [${p.title}](${site.url}/writing/${p.slug}): ${p.summary}`,
    ),
    "",
    "## Links",
    `- [Updates](${site.url}/updates)`,
    `- [Resume (PDF)](${site.url}${profile.links.resume})`,
    `- [GitHub](${profile.links.github})`,
    `- [LinkedIn](${profile.links.linkedin})`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
