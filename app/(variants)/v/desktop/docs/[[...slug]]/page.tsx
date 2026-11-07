import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { mdxComponents } from "@/components/site/mdx-components"
import { vh } from "@/components/variants/desktop/apps"
import { Reader, type Chapter } from "@/components/variants/desktop/reader"
import {
  DOCS_INDEX_SLUG,
  docsNav,
  docsSlugs,
  getDocsPage,
  getDocsSiblings,
  getSectionForSlug,
} from "@/lib/docs/nav"
import { rehypeCodeMeta } from "@/lib/mdx/rehype-code-meta"
import { extractToc, getDocContent } from "@/lib/mdx/source"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

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
  const page = getDocsPage(resolveSlug(slug))
  if (!page) return { title: "Page not found" }
  return {
    title: page.title,
    description: page.description,
    robots: { index: false, follow: false },
  }
}

/*
 * The MDX is the original site's, rendered through its own component map
 * with a few changes: every internal link stays inside this variant, and
 * prose and headings are set for the reader's page rather than a docs
 * column.
 */
const components = {
  ...mdxComponents,
  a: ({ href = "", className, ...props }: React.ComponentPropsWithoutRef<"a">) => {
    const style = cn("d-prose-link", className)
    if (href.startsWith("/")) return <Link href={vh(href)} className={style} {...props} />
    if (href.startsWith("#")) return <a href={href} className={style} {...props} />
    return <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props} />
  },
  h2: ({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className={cn("d-prose-h2", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className={cn("d-prose-h3", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className={cn("d-prose-p", className)} {...props} />
  ),
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

  const chapters: Chapter[] = docsNav.map((entry) => ({
    title: entry.title,
    items: entry.items.map((item) => ({
      title: item.title,
      href: vh(item.href),
      current: item.slug === resolved,
      label: item.label,
    })),
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: `${siteConfig.url}${page.href}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reader
        chapters={chapters}
        section={section?.title}
        title={page.title}
        description={page.description}
        toc={toc}
        previous={previous ? { title: previous.title, href: vh(previous.href) } : undefined}
        next={next ? { title: next.title, href: vh(next.href) } : undefined}
      >
        <MDXRemote
          source={source}
          components={components}
          options={{
            parseFrontmatter: false,
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeCodeMeta],
            },
          }}
        />
      </Reader>
    </>
  )
}
