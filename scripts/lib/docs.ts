// Collects everything on the site that the assistant may answer from.
import { readRaw, type Metric } from "../../src/lib/content";
import type { Doc } from "../../src/lib/search/chunk";
import {
  about,
  focus,
  otherProjects,
  profile,
  skills,
  timeline,
} from "../../src/data/profile";

export function collectDocs(): Doc[] {
  const docs: Doc[] = [];

  for (const { slug, data, markdown } of readRaw("projects")) {
    const metrics = ((data.metrics ?? []) as Metric[])
      .map((m) => `${m.value}: ${m.label}.`)
      .join(" ");
    const intro = [
      data.summary,
      data.status,
      metrics && `Key numbers. ${metrics}`,
      data.tags && `Built with ${(data.tags as string[]).join(", ")}.`,
    ]
      .filter(Boolean)
      .join("\n");
    docs.push({
      url: `/projects/${slug}`,
      title: String(data.title),
      kind: "project",
      markdown: `${intro}\n\n${markdown}`,
    });
  }

  for (const { slug, data, markdown } of readRaw("writing")) {
    docs.push({
      url: `/writing/${slug}`,
      title: String(data.title),
      kind: "post",
      markdown: `${data.summary ?? ""}\n\n${markdown}`,
    });
  }

  for (const { slug, data, markdown } of readRaw("updates")) {
    docs.push({
      url: `/updates#${slug}`,
      title: String(data.title),
      kind: "update",
      markdown,
    });
  }

  docs.push({
    url: "/#about",
    title: "About Roshan",
    kind: "profile",
    markdown: [
      `${profile.name}. ${profile.eyebrow}. ${profile.headline}`,
      profile.intro,
      ...about,
      ...focus.map((f) => `${f.title}: ${f.body}`),
    ].join("\n"),
  });

  docs.push({
    url: "/#contact",
    title: "Contact and availability",
    kind: "profile",
    markdown: [
      `${profile.availability}. Roshan is based in ${profile.location}.`,
      `To contact or hire Roshan, email him. His email address is ${profile.email}.`,
      `LinkedIn: ${profile.links.linkedin}. GitHub: ${profile.links.github}. Medium: ${profile.links.medium}.`,
      "His resume (CV) can be downloaded as a PDF from the site.",
    ].join("\n"),
  });

  for (const item of timeline) {
    docs.push({
      url: "/#journey",
      title: `${item.title}, ${item.org}`,
      kind: "profile",
      markdown: [
        `${item.kind}: ${item.title} at ${item.org}, ${item.period}.`,
        item.title.startsWith("B.Tech") ? "This is his bachelor's degree (undergraduate)." : "",
        item.title.startsWith("MSc") ? "This is his master's degree, where he studies now." : "",
        ...item.points,
      ].join("\n"),
    });
  }

  docs.push({
    url: "/#skills",
    title: "Skills",
    kind: "profile",
    markdown: skills
      .map((s) => `${s.group}: ${s.items.join(", ")}.`)
      .join("\n"),
  });

  for (const p of otherProjects) {
    docs.push({
      url: "/#projects",
      title: p.title,
      kind: "project",
      markdown: `${p.body} Built with ${p.tags.join(", ")}.`,
    });
  }

  return docs;
}
