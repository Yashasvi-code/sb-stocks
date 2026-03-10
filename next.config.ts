import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Hide hydration error overlay in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
  // output: "standalone",
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // reactStrictMode: false,
};

export default nextConfig;
