import { ImageResponse } from "next/og"

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
 */
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
            width: 40,
            height: 40,
            border: "3px solid #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          J
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            border: "2px solid #000000",
            padding: "5px 14px",
            fontSize: 19,
            letterSpacing: 2,
            textTransform: "uppercase",
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
            color: "#5c5c5c",
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
          borderTop: "2px solid #000000",
          paddingTop: 22,
          fontSize: 21,
          color: "#3a3a3a",
        }}
      >
        <div style={{ display: "flex" }}>
          {siteConfig.namespace}/{slug}
        </div>
        <div style={{ display: "flex", marginLeft: 24 }}>
          {dependencies.length === 0
            ? "No dependencies"
            : `${dependencies.length} dependenc${dependencies.length === 1 ? "y" : "ies"}`}
        </div>
      </div>
    </div>,
    size
  )
}
