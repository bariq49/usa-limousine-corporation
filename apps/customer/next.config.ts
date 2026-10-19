import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@usa-limousine-corporation/ui"],
  allowedDevOrigins: ["127.0.0.1"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
