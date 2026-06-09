import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const privateNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, max-age=0, must-revalidate",
  },
];

const privateNoIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
];

const publicRevalidateHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, must-revalidate",
  },
];

const privateNoStoreRoutes = [
  "/",
  "/about",
  "/admin/:path*",
  "/api/:path*",
  "/app/:path*",
  "/feed/:path*",
  "/leaderboard",
  "/login",
  "/markets",
  "/markets/:path*",
  "/notifications/:path*",
  "/offline",
  "/privacy",
  "/signup",
  "/terms",
  "/users/:path*",
];

const privateNoIndexRoutes = [
  "/admin/:path*",
  "/api/:path*",
  "/app/:path*",
  "/feed/:path*",
  "/leaderboard",
  "/login",
  "/notifications/:path*",
  "/signup",
  "/users/:path*",
];

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...privateNoStoreRoutes.map((source) => ({
        source,
        headers: privateNoStoreHeaders,
      })),
      ...privateNoIndexRoutes.map((source) => ({
        source,
        headers: privateNoIndexHeaders,
      })),
      {
        source: "/sw.js",
        headers: publicRevalidateHeaders,
      },
      {
        source: "/manifest.webmanifest",
        headers: publicRevalidateHeaders,
      },
      {
        source: "/icon.svg",
        headers: publicRevalidateHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
