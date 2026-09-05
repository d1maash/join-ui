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
import { revealAt } from "@/lib/reveal"
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
          className="reveal mb-8"
        />

        {/*
          Crumbs, title, standfirst, then the article as one piece, rising
          less than the head did. A guide is read top to bottom and its body
          is the thing being waited for, so it comes in whole and quickly
          rather than section by section — nothing further down a page of
          documentation should be seen arriving.
        */}
        <article className="max-w-3xl">
          <header className="mb-10 flex flex-col gap-3 border-b border-border pb-8">
            <h1
              className="reveal reveal-dither text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.032em] [--reveal-y:0.2em]"
              style={revealAt(1)}
            >
              {page.title}
            </h1>
            <p
              className="reveal text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground"
              style={revealAt(2)}
            >
              {page.description}
            </p>
          </header>

          <div className="reveal [--reveal-y:0.5rem]" style={revealAt(3)}>
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
          </div>
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
