import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site"

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Social card.
 *
 * Ink on paper, laid out on the same rule grid as the site: a hairline frame,
 * one horizontal division and type doing all of the work.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: "#ffffff",
        color: "#000000",
        border: "12px solid #000000",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          J
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#5c5c5c",
          }}
        >
          Component registry
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: -3,
            maxWidth: 940,
          }}
        >
          Components you actually own
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 27,
            lineHeight: 1.4,
            color: "#5c5c5c",
            maxWidth: 820,
          }}
        >
          Accessible, animated React components for Next.js — with a shadcn-compatible
          registry and a prompt for your coding agent.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: "2px solid #000000",
          paddingTop: 22,
          fontSize: 22,
          color: "#3a3a3a",
        }}
      >
        <div style={{ display: "flex" }}>
          pnpm dlx shadcn@latest add {siteConfig.namespace}/…
        </div>
      </div>
    </div>,
    size
  )
}
