import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ComponentPreview } from "@/components/site/component-preview"
import { LogoMark } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import { allComponents, getComponent } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

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
 * Rendered outside the site shell so the component gets the whole viewport —
 * useful for checking responsive behaviour and for embedding in an iframe.
 */
export default async function FullPreviewPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/components/${component.slug}`}>
            <ArrowLeft aria-hidden="true" />
            Back to docs
          </Link>
        </Button>

        <div className="ml-auto flex items-center gap-3">
          <span className="label-caps hidden text-muted-foreground sm:inline">
            {component.title}
          </span>
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <LogoMark className="size-6" />
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 flex-col p-4 sm:p-6">
        <h1 className="sr-only">{component.title} preview</h1>
        <ComponentPreview
          slug={component.slug}
          title={component.title}
          fullPreviewLink={false}
          minHeight="calc(100dvh - 8rem)"
          className="flex-1"
        />
      </main>
    </div>
  )
}
