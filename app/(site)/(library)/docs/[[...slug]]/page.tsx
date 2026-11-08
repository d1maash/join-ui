import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { CopyButton } from "@/components/site/copy-button"
import { siteMdx } from "@/components/site/mdx"
import { Toc } from "@/components/site/toc"
import {
  DOCS_INDEX_SLUG,
  docsSlugs,
  getDocsPage,
  getDocsSiblings,
  getSectionForSlug,
} from "@/lib/docs/nav"
import { rehypeCodeMeta } from "@/lib/mdx/rehype-code-meta"
import { extractToc, getDocContent } from "@/lib/mdx/source"
import { siteConfig } from "@/lib/site"

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...docsSlugs.map((slug) => ({ slug: [slug] }))]
}

function resolveSlug(segments: string[] | undefined): string | null {
  if (!segments || segments.length === 0) return DOCS_INDEX_SLUG
  if (segments.length > 1) return null
  return segments[0] ?? DOCS_INDEX_SLUG
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = resolved ? getDocsPage(resolved) : undefined
  if (!page) return { title: "Page not found", robots: { index: false } }
  const canonical = slug?.length ? `/docs/${resolved}` : "/docs"
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${page.title} — ${siteConfig.name}`,
      description: page.description,
      url: canonical,
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
  const page = resolved ? getDocsPage(resolved) : undefined
  if (!resolved || !page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)
  const editUrl = `${siteConfig.links.repo}/blob/main/content/docs/${resolved}.mdx`
  const minutes = Math.max(1, Math.round(source.split(/\s+/).length / 230))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: `${siteConfig.url}${page.href}`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    author: { "@type": "Organization", name: siteConfig.author },
  }

  return (
    <main id="main-content" className="px-4 pt-10 pb-16 sm:px-6 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid max-w-[70rem] gap-12 xl:grid-cols-[minmax(0,1fr)_13rem] 2xl:gap-20">
        <article className="max-w-[46rem] min-w-0">
          <header className="mb-10 flex flex-col gap-3 border-b border-[var(--g-line)] pb-8">
            <p className="text-[0.8125rem] font-medium text-[var(--g-accent-ink)]">
              {section?.title ?? "Docs"}
            </p>
            <h1 className="g-title text-[2rem] text-[var(--g-ink)] sm:text-[2.375rem]">
              {page.title}
            </h1>
            <p className="text-[1rem] leading-relaxed text-pretty text-[var(--g-ink-3)]">
              {page.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CopyButton
                value={source}
                label="Copy page"
                copiedLabel="Copied"
                toastMessage={`${page.title} copied as Markdown`}
                variant="secondary"
                showLabel
              />
              <a
                href={editUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="g-btn g-btn-ghost h-8 px-2.5"
              >
                <Pencil aria-hidden="true" className="!size-3.5" />
                Edit on GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <span className="g-num ml-auto text-[0.75rem] text-[var(--g-ink-4)]">
                {minutes} min read
              </span>
            </div>
          </header>

          <div className="g-doc">
            <MDXRemote
              source={source}
              components={siteMdx}
              options={{
                parseFrontmatter: false,
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                },
              }}
            />
          </div>

          <nav aria-label="Documentation" className="mt-16 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                href={previous.href}
                className="group flex flex-col gap-1 rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)] px-5 py-4 transition-colors hover:border-[var(--g-line-3)]"
              >
                <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--g-ink-4)]">
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  Previous
                </span>
                <span className="text-[0.9375rem] font-medium text-[var(--g-ink)]">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={next.href}
                className="group flex flex-col items-end gap-1 rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)] px-5 py-4 text-right transition-colors hover:border-[var(--g-line-3)]"
              >
                <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--g-ink-4)]">
                  Next
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </span>
                <span className="text-[0.9375rem] font-medium text-[var(--g-ink)]">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--g-top)+2.5rem)] flex flex-col gap-8">
            <Toc entries={toc} />
            <div className="flex flex-col gap-2 border-t border-[var(--g-line)] pt-5 text-[0.8125rem]">
              <a
                href={editUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
              >
                Edit this page
              </a>
              <a
                href={siteConfig.links.issues}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
              >
                Report an issue
              </a>
              <Link
                href={"/components"}
                className="text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
              >
                Browse components
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
