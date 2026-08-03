import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

/**
 * The icon is the Join Way monogram on its black tile — the same file the
 * studio site installs with, so an installed shortcut to the docs sits next to
 * one for join-way.com and reads as the same product.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    // The site renders dark only, so the splash and the chrome agree with it.
    background_color: "#141210",
    theme_color: "#141210",
    lang: "en",
    categories: ["developer", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "1000x1000", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "1000x1000", type: "image/png", purpose: "maskable" },
    ],
  }
}
