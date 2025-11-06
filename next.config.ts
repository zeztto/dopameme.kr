import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['bcryptjs', 'postgres'],
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'postgres'],
  },
};

export default nextConfig;
