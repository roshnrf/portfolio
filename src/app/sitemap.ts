import type { MetadataRoute } from "next";
import { site } from "@/data/profile";
import { getPosts, getProjects } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/updates",
    "/writing",
    "/playground",
    ...getProjects().map((p) => `/projects/${p.slug}`),
    ...getPosts().map((p) => `/writing/${p.slug}`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p}` }));
}
