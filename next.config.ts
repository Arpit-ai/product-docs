import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TODO: tighten ESLint and fix `any` types in dashboard pages
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
