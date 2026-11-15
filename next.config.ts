import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static content read from /content at build time,
  // so Cache Components and partial prefetching are left off.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
