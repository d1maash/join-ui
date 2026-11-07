import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { ComponentThumb } from "@/components/previews/thumbs/registry"
import { ComponentPreview } from "@/components/site/component-preview"
import { allComponents, getComponent } from "@/lib/registry"
import { cn } from "@/lib/utils"

/*
 * A bench for the component redesign: the preview and the thumbnail of one
 * component, once on the light tokens and once on the dark, so both theme
 * islands can be checked in a single screenshot. Not linked from anywhere.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

const SIZES = [
  { width: 320, height: 230 },
  { width: 440, height: 300 },
  { width: 600, height: 400 },
]

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  return (
    <main id="main-content">
      {(["light", "dark"] as const).map((scheme) => (
        <section
          key={scheme}
          aria-label={`${scheme} theme`}
          className={cn(scheme, "bg-background p-6 text-foreground")}
        >
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            {component.title} — {scheme}
          </p>
          <ComponentPreview slug={slug} title={component.title} fullPreviewLink={false} />
          <div className="mt-6 flex flex-wrap items-start gap-4">
            {SIZES.map((size) => (
              <div
                key={size.width}
                inert
                aria-hidden="true"
                className="shrink-0 overflow-hidden rounded-[22px] bg-card shadow-sm"
                style={{ width: size.width, height: size.height }}
              >
                <ComponentThumb slug={slug} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
