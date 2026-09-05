import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

/**
 * Join UI's connected modules on a dark tile. The generated icon keeps the
 * entire mark inside the circular safe area for maskable launcher icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    // The site renders dark only, so the splash and the chrome agree with it.
    background_color: "#050506",
    theme_color: "#050506",
    lang: "en",
    categories: ["developer", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
