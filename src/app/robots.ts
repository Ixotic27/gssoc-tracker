import type { MetadataRoute } from "next";

const BASE = "https://gssoc-pa.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        // Block AI crawlers from hammering the API-heavy tracker pages
        userAgent: ["GPTBot", "CCBot", "anthropic-ai", "Google-Extended"],
        disallow: ["/project-admin/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
