import { ImageResponse } from "next/og"

import { MARK } from "@/components/site/logo"
import { allComponents, getComponent } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

export const alt = "Component preview card"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

/**
 * Per-component social card, generated at build time from registry metadata.
 *
 * Satori resolves no custom properties, so the dark theme's tokens are inlined
 * as hex — the same set the site-wide card uses. Keep both in sync with
 * `globals.css`.
 */
const PAGE = "#050506"
const INK = "#f6f7f7"
const MUTED = "#aeafb1"
const HAIRLINE = "#313234"
const PANEL = "#111213"

export default async function ComponentOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = getComponent(slug)

  const title = component?.title ?? "Component"
  const description = component?.description ?? siteConfig.description
  const category = component?.category ?? "Components"
  const dependencies = component?.dependencies ?? []

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
            width: 42,
            height: 42,
            borderRadius: 11,
            backgroundColor: INK,
            color: PAGE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <svg viewBox={MARK.viewBox} width={29} height={29}>
            <path
              d={MARK.stems}
              fill="none"
              stroke={PAGE}
              strokeWidth={MARK.stemsWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={MARK.middle}
              fill="none"
              stroke={PAGE}
              strokeWidth={MARK.middleWidth}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            borderRadius: 999,
            border: `1px solid ${HAIRLINE}`,
            backgroundColor: PANEL,
            padding: "7px 18px",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: -0.2,
            color: INK,
          }}
        >
          {category}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.0,
            maxWidth: 960,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            lineHeight: 1.4,
            color: MUTED,
            maxWidth: 900,
          }}
        >
          {description}
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
          fontSize: 21,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", color: INK }}>
          {siteConfig.namespace}/{slug}
        </div>
        <div style={{ display: "flex", marginLeft: "auto" }}>
          {dependencies.length === 0
            ? "No dependencies"
            : `${dependencies.length} dependenc${dependencies.length === 1 ? "y" : "ies"}`}
        </div>
      </div>
    </div>,
    size
  )
}
