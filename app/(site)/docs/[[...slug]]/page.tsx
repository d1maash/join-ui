import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { Breadcrumbs } from "@/components/site/breadcrumbs"
import { mdxComponents } from "@/components/site/mdx-components"
import { PrevNextNavigation } from "@/components/site/prev-next"
import { DocsShell } from "@/components/site/shell"
import { TableOfContents } from "@/components/site/table-of-contents"
import {
  DOCS_INDEX_SLUG,
  docsSlugs,
  getDocsPage,
  getDocsSiblings,
  getSectionForSlug,
} from "@/lib/docs/nav"
import { extractToc, getDocContent } from "@/lib/mdx/source"
import { rehypeCodeMeta } from "@/lib/mdx/rehype-code-meta"
import { siteConfig } from "@/lib/site"

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...docsSlugs.map((slug) => ({ slug: [slug] }))]
}

function resolveSlug(segments: string[] | undefined): string {
  return segments?.[0] ?? DOCS_INDEX_SLUG
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) return { title: "Page not found" }

  const canonical = slug?.length ? `/docs/${resolved}` : "/docs"

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${page.title} — ${siteConfig.name}`,
      description: page.description,
      url: `${siteConfig.url}${canonical}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} — ${siteConfig.name}`,
      description: page.description,
    },
  }
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: `${siteConfig.url}${page.href}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    author: { "@type": "Organization", name: siteConfig.author },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DocsShell aside={toc.length > 0 ? <TableOfContents entries={toc} /> : undefined}>
        <Breadcrumbs
          items={[
            { label: "Docs", href: "/docs" },
            ...(section ? [{ label: section.title }] : []),
            { label: page.title },
          ]}
          className="mb-8"
        />

        <article className="max-w-3xl">
          <header className="mb-10 flex flex-col gap-3 border-b border-border pb-8">
            <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.015em]">
              {page.title}
            </h1>
            <p className="text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
              {page.description}
            </p>
          </header>

          <MDXRemote
            source={source}
            components={mdxComponents}
            options={{
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeCodeMeta],
              },
            }}
          />
        </article>

        <PrevNextNavigation
          className="mt-14 max-w-3xl"
          label="Documentation navigation"
          previous={
            previous ? { title: previous.title, href: previous.href } : undefined
          }
          next={next ? { title: next.title, href: next.href } : undefined}
        />
      </DocsShell>
    </>
  )
}
