import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Hide hydration error overlay in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // output: "standalone",
  // /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // reactStrictMode: false,
};

export default nextConfig;
