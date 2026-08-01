import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The registry source files are read from disk at build time so that the
  // documentation always renders the exact code the CLI ships.
  outputFileTracingIncludes: {
    "/components/[slug]": ["./registry/**/*"],
    "/preview/[slug]": ["./registry/**/*"],
    "/docs/[[...slug]]": ["./content/**/*"],
  },
  async headers() {
    return [
      {
        // Registry items are consumed by the shadcn CLI from arbitrary origins.
        source: "/r/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Content-Type", value: "application/json; charset=utf-8" },
        ],
      },
    ]
  },
}

export default nextConfig
