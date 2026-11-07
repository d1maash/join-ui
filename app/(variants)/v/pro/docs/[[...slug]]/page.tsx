import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import {
  DocsMobileMenu,
  DocsSidebar,
  DocsToc,
} from "@/components/variants/pro/docs-nav"
import { proHref } from "@/components/variants/pro/href"
import { proMdxComponents } from "@/components/variants/pro/mdx"
import { PagerLink } from "@/components/variants/pro/sheet"
import { getSidebarSections } from "@/lib/docs/sidebar"
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
 * Docs, as a developer.apple.com article: a quiet sidebar, one reading column
 * at 17px with generous leading, the contents rail on the right, and the next
 * article as a tile at the bottom rather than a pair of arrows.
 */
export default async function ProDocsPage({ params }: PageProps) {
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
    title: group.title,
    items: group.items.map((item) => ({ ...item, href: proHref(item.href) })),
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

      <div className="mx-auto max-w-[1280px] px-6 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[232px_minmax(0,1fr)_200px]">
        <aside className="hidden lg:block">
          <div className="pro-no-scrollbar sticky top-12 max-h-[calc(100dvh-48px)] overflow-y-auto pt-12">
            <DocsSidebar sections={sections} currentHref={proHref(page.href)} />
          </div>
        </aside>

        <main id="main-content" className="min-w-0 pt-8 pb-32 lg:pt-14">
          <DocsMobileMenu
            sections={sections}
            current={page.title}
            currentHref={proHref(page.href)}
          />

          <article className="mx-auto mt-10 max-w-[720px] lg:mt-0">
            <header className="border-b border-white/[0.12] pb-10">
              {section ? (
                <p className="text-[17px] font-semibold tracking-[-0.022em] text-[#86868b]">
                  {section.title}
                </p>
              ) : null}
              <h1 className="mt-2 text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance text-[#f5f5f7]">
                {page.title}
              </h1>
              <p className="mt-5 text-[21px] leading-[1.4] font-medium tracking-[-0.022em] text-pretty text-[#86868b]">
                {page.description}
              </p>
            </header>

            <div className="pro-prose pt-4">
              <MDXRemote
                source={source}
                components={proMdxComponents}
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
              aria-label="Documentation navigation"
              className="mt-20 grid gap-4 border-t border-white/[0.12] pt-10 sm:grid-cols-2"
            >
              {previous ? (
                <PagerLink
                  href={proHref(previous.href)}
                  direction="Previous"
                  title={previous.title}
                />
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <PagerLink
                  href={proHref(next.href)}
                  direction="Next"
                  title={next.title}
                  end
                />
              ) : null}
            </nav>
          </article>
        </main>

        {toc.length > 0 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-12 pt-14">
              <DocsToc entries={toc} />
            </div>
          </aside>
        ) : null}
      </div>
    </>
  )
}
