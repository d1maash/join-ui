import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PreviewStage } from "@/components/site/preview-stage"
import { allComponents, getComponent } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

import "../../../(site)/site.css"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Preview not found" }

  return {
    title: `${component.title} preview`,
    description: `Full-page preview of the ${component.title} component from ${siteConfig.name}.`,
    alternates: { canonical: `/preview/${component.slug}` },
    // Previews duplicate the component page's content — keep them out of the index.
    robots: { index: false, follow: true },
  }
}

/**
 * Standalone preview.
 *
 * Rendered outside the site shell so the component gets the whole viewport.
 * The component page's workbench loads this route in a frame for its tablet
 * and phone widths, so the component's own responsive layout really engages —
 * which is why the bar is slim and the stage is the site's own dark surface.
 */
export default async function FullPreviewPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  return (
    <div className="join-site dark flex min-h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--g-line)] px-3 sm:px-4">
        <Link href={`/components/${component.slug}`} className="g-btn g-btn-ghost">
          <ArrowLeft aria-hidden="true" />
          {component.title}
        </Link>
        <Link
          href="/"
          className="ml-auto text-[0.8125rem] font-medium text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
        >
          {siteConfig.name}
        </Link>
      </header>

      <main id="main-content" className="flex flex-1 flex-col">
        <h1 className="sr-only">{component.title} preview</h1>
        <PreviewStage slug={component.slug} />
      </main>
    </div>
  )
}
