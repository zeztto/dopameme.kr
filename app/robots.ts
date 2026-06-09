import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/markets",
        "/terms",
        "/privacy",
        "/manifest.webmanifest",
        "/icon.svg",
        "/opengraph-image",
        "/.well-known/security.txt",
      ],
      disallow: [
        "/admin",
        "/api",
        "/app",
        "/feed",
        "/leaderboard",
        "/login",
        "/notifications",
        "/offline",
        "/signup",
        "/users",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
