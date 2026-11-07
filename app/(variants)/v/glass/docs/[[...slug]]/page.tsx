import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { ChevronDown } from "lucide-react"

import { DocsToc } from "@/components/variants/glass/docs-nav"
import { glassMdx } from "@/components/variants/glass/mdx"
import { SiblingNav } from "@/components/variants/glass/sibling"
import { g } from "@/components/variants/glass/ui"
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
  const page = getDocsPage(resolveSlug(slug))
  if (!page) return { title: "Page not found" }
  return { title: page.title, description: page.description }
}

export default async function GlassDocsPage({ params }: PageProps) {
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
    author: { "@type": "Organization", name: siteConfig.author },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content" className="flex gap-6">
        <div className="min-w-0 flex-1">
          {/*
            Long-form reading sits on paper: a near-opaque pane, so the
            wallpaper is a tint at the edges and never a texture under a line
            of text.
          */}
          <article className="g-glass g-paper g-settle rounded-[34px] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 xl:px-16">
            <div className="mx-auto max-w-[44rem]">
              <header className="mb-10">
                {section ? (
                  <p className="text-[17px] font-semibold tracking-[-0.02em] text-[#0066cc]">
                    {section.title}
                  </p>
                ) : null}
                <h1 className="mt-2 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-semibold tracking-[-0.042em] text-balance text-[#1d1d1f]">
                  {page.title}
                </h1>
                <p className="mt-4 text-[19px] leading-[1.42] tracking-[-0.02em] text-pretty text-[#3a3a3e] sm:text-[21px] sm:leading-[1.38]">
                  {page.description}
                </p>
              </header>

              {toc.length > 0 ? (
                <details className="group mb-10 rounded-[20px] bg-black/[0.035] xl:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] px-5 py-3.5 text-[15px] font-semibold tracking-[-0.016em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] [&::-webkit-details-marker]:hidden">
                    On this page
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 text-[#56565b] transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <ul className="flex flex-col px-5 pb-4">
                    {toc.map((entry) => (
                      <li key={entry.id}>
                        <a
                          href={`#${entry.id}`}
                          className={`block rounded-md py-1.5 text-[15px] text-[#0066cc] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${entry.level === 3 ? "pl-4" : ""}`}
                        >
                          {entry.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              <div className="g-prose">
                <MDXRemote
                  source={source}
                  components={glassMdx}
                  options={{
                    parseFrontmatter: false,
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                    },
                  }}
                />
              </div>
            </div>
          </article>

          <SiblingNav
            label="Documentation navigation"
            className="mt-5"
            previous={previous ? { title: previous.title, href: g(previous.href) } : undefined}
            next={next ? { title: next.title, href: g(next.href) } : undefined}
          />
        </div>

        {toc.length > 0 ? (
          <aside className="hidden w-[232px] shrink-0 xl:block">
            <div className="sticky top-[80px] max-h-[calc(100dvh-80px-88px)] overflow-y-auto">
              <DocsToc entries={toc} />
            </div>
          </aside>
        ) : null}
      </main>
    </>
  )
}
