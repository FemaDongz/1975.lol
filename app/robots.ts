import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://1975.lol/sitemap.xml",
    host: "https://1975.lol",
  };
}
