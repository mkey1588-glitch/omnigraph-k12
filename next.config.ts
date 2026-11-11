import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/**/*": ["./drizzle/**/*"],
  },
};

export default nextConfig;
