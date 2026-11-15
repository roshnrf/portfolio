// RSS feed for the updates page.
import { profile, site } from "@/data/profile";
import { getUpdates } from "@/lib/content";

export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Links inside a post are site-relative; feed readers need absolute ones. */
const absolutise = (html: string) =>
  html.replace(/(href|src)="\//g, `$1="${site.url}/`).replace(/]]>/g, "]]&gt;");

export function GET() {
  const items = getUpdates()
    .map((update) => {
      const url = `${site.url}/updates#${update.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(update.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${update.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        `      <description><![CDATA[${absolutise(update.html)}]]></description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(profile.name)}: updates</title>
    <link>${site.url}/updates</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${site.url}/updates/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
