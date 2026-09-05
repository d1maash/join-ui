import { ImageResponse } from "next/og"

import { MARK } from "@/lib/brand"
import { siteConfig } from "@/lib/site"

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Social card.
 *
 * The design tokens do not reach Satori — it resolves no custom properties — so
 * the dark theme's values are inlined here, resolved from `oklch` to hex. The
 * site renders dark, and a social card that opened light would be the one
 * surface that disagreed with it. Keep this in sync with `globals.css`.
 */
const PAGE = "#050506"
const INK = "#f6f7f7"
const MUTED = "#aeafb1"
const HAIRLINE = "#313234"
const PANEL = "#111213"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 68,
        backgroundColor: PAGE,
        color: INK,
        fontFamily: "sans-serif",
      }}
    >
      {/* An ink rule along the top edge — the card's one graphic element. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          display: "flex",
          backgroundColor: INK,
        }}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            backgroundColor: INK,
            color: PAGE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <svg viewBox={MARK.viewBox} width={32} height={32}>
            {MARK.paths.map((d) => (
              <path key={d} d={d} fill={PAGE} />
            ))}
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            borderRadius: 999,
            border: `1px solid ${HAIRLINE}`,
            backgroundColor: PANEL,
            padding: "8px 18px",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: -0.2,
            color: MUTED,
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
            color: MUTED,
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
          borderRadius: 14,
          border: `1px solid ${HAIRLINE}`,
          backgroundColor: PANEL,
          padding: "20px 24px",
          fontSize: 22,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", color: INK, marginRight: 12 }}>$</div>
        <div style={{ display: "flex" }}>
          pnpm dlx shadcn@latest add {siteConfig.namespace}/…
        </div>
      </div>
    </div>,
    size
  )
}
