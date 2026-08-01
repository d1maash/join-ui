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
        padding: 72,
        backgroundColor: "#191a1f",
        backgroundImage:
          "radial-gradient(circle at 85% 10%, rgba(56,196,178,0.26), transparent 45%), radial-gradient(circle at 10% 95%, rgba(163,214,88,0.16), transparent 42%)",
        color: "#f4f4f6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: "2px solid rgba(244,244,246,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            fontSize: 24,
            fontWeight: 700,
            color: "#5ed6bd",
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
            marginLeft: 18,
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(244,244,246,0.2)",
            fontSize: 19,
            color: "rgba(244,244,246,0.7)",
          }}
        >
          {category}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.05,
            maxWidth: 960,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 28,
            lineHeight: 1.4,
            color: "rgba(244,244,246,0.66)",
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
          fontSize: 21,
          color: "rgba(244,244,246,0.5)",
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
