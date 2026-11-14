import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the public pages; everything else needs an account and is noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/credit", "/auth/signup"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.5 : 1,
  }));
}
