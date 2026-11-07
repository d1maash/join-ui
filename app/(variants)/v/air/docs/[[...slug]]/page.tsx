import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { AirDocsMobileBar, AirDocsSidebar, AirToc } from "@/components/variants/air/docs-nav"
import { air } from "@/components/variants/air/href"
import { airMdxComponents } from "@/components/variants/air/mdx"
import {
  DOCS_INDEX_SLUG,
  docsSlugs,
  getDocsPage,
  getDocsSiblings,
  getSectionForSlug,
} from "@/lib/docs/nav"
import { getSidebarSections } from "@/lib/docs/sidebar"
import { rehypeCodeMeta } from "@/lib/mdx/rehype-code-meta"
import { extractToc, getDocContent } from "@/lib/mdx/source"
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

/*
 * Documentation, after Apple Developer: a navigator on the left, a readable
 * 17px column in the middle with the section as its eyebrow and the abstract
 * under the title, "On this page" on the right at wide sizes, and the next
 * article as a card at the end.
 */
export default async function AirDocsPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)
  const sections = getSidebarSections().map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, href: air(item.href) })),
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: `${siteConfig.url}${page.href}`,
    author: { "@type": "Organization", name: siteConfig.author },
  }

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AirDocsMobileBar sections={sections} current={page.title} />

      <div className="mx-auto flex max-w-[90rem]">
        <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-[17.5rem] shrink-0 overflow-y-auto border-r border-[#e8e8ed] bg-[#fbfbfd] lg:block">
          <AirDocsSidebar sections={sections} />
        </aside>

        <main id="main-content" className="min-w-0 flex-1">
          <div className="mx-auto flex max-w-[68rem] gap-12 px-5 sm:px-10 xl:px-14">
            <article className="air-prose min-w-0 flex-1 pt-12 pb-24 sm:pt-16 lg:max-w-[46rem]">
              <header className="mb-12 border-b border-[#d2d2d7] pb-10">
                <p className="air-rise text-[17px] font-semibold tracking-[-0.014em] text-[#6e6e73]">
                  {section?.title ?? "Documentation"}
                </p>
                <h1
                  className="air-rise mt-2 text-[clamp(2.25rem,4.4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.036em] text-[#1d1d1f]"
                  style={{ ["--air-delay" as string]: "60ms" }}
                >
                  {page.title}
                </h1>
                <p
                  className="air-rise mt-4 text-[21px] leading-[1.38] tracking-[-0.016em] text-[#6e6e73]"
                  style={{ ["--air-delay" as string]: "120ms" }}
                >
                  {page.description}
                </p>
              </header>

              <div className="air-rise" style={{ ["--air-delay" as string]: "180ms" }}>
                <MDXRemote
                  source={source}
                  components={airMdxComponents}
                  options={{
                    parseFrontmatter: false,
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                    },
                  }}
                />
              </div>

              <nav
                aria-label="Previous and next article"
                className="mt-20 grid gap-3 border-t border-[#d2d2d7] pt-8 sm:grid-cols-2"
              >
                {previous ? (
                  <Link
                    href={air(previous.href)}
                    className="group flex flex-col rounded-[18px] bg-[#f5f5f7] p-5 transition-colors hover:bg-[#ececf0] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                  >
                    <span className="flex items-center gap-1 text-[14px] text-[#6e6e73]">
                      <ChevronLeft aria-hidden="true" className="size-3.5" /> Previous
                    </span>
                    <span className="mt-1 text-[19px] font-semibold tracking-[-0.016em] text-[#1d1d1f]">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <Link
                    href={air(next.href)}
                    className="group flex flex-col items-end rounded-[18px] bg-[#f5f5f7] p-5 text-right transition-colors hover:bg-[#ececf0] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                  >
                    <span className="flex items-center gap-1 text-[14px] text-[#6e6e73]">
                      Next <ChevronRight aria-hidden="true" className="size-3.5" />
                    </span>
                    <span className="mt-1 text-[19px] font-semibold tracking-[-0.016em] text-[#1d1d1f]">
                      {next.title}
                    </span>
                    <span className="mt-1 text-[14px] text-[#6e6e73]">{next.description}</span>
                  </Link>
                ) : null}
              </nav>
            </article>

            {toc.length > 0 ? (
              <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-52 shrink-0 overflow-y-auto xl:block">
                <AirToc entries={toc} />
              </aside>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
