import type { MetadataRoute } from "next";
import { pages, site } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${site.url}${p.href === "/" ? "" : p.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p.href === "/" ? 1 : 0.8,
  }));
}
