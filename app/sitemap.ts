import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: absoluteUrl("/markets"),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: absoluteUrl("/about"),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: absoluteUrl("/terms"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: absoluteUrl("/privacy"),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const markets = await prisma.market.findMany({
      where: {
        hidden: false,
        status: { in: ["active", "resolved"] },
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    return [
      ...staticRoutes,
      ...markets.map((market) => ({
        url: absoluteUrl(`/markets/${market.id}`),
        lastModified: market.createdAt,
        changeFrequency: market.status === "active" ? "hourly" as const : "weekly" as const,
        priority: market.status === "active" ? 0.8 : 0.5,
      })),
    ];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return staticRoutes;
  }
}
