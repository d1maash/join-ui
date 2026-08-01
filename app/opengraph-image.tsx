import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site"

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#191a1f",
          backgroundImage:
            "radial-gradient(circle at 12% 6%, rgba(56,196,178,0.30), transparent 46%), radial-gradient(circle at 88% 92%, rgba(163,214,88,0.20), transparent 44%)",
          color: "#f4f4f6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              border: "2px solid rgba(244,244,246,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
              fontSize: 26,
              fontWeight: 700,
              color: "#5ed6bd",
            }}
          >
            J
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Motion-first components you actually own
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 27,
              lineHeight: 1.4,
              color: "rgba(244,244,246,0.66)",
              maxWidth: 820,
            }}
          >
            Accessible, animated React components for Next.js — with a
            shadcn-compatible registry and a prompt for your coding agent.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(244,244,246,0.5)",
          }}
        >
          <div style={{ display: "flex" }}>
            pnpm dlx shadcn@latest add {siteConfig.namespace}/…
          </div>
        </div>
      </div>
    ),
    size
  )
}
