import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { runMdxComponents } from "@/components/variants/run/mdx"
import { PrevNext } from "@/components/variants/run/prev-next"
import { SourceList } from "@/components/variants/run/source-list"
import { Toc } from "@/components/variants/run/toc"
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
import { variantHref } from "@/lib/variants"

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

const href = (path: string) => variantHref("run", path)

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...docsSlugs.map((slug) => ({ slug: [slug] }))]
}

function resolveSlug(segments: string[] | undefined): string {
  return segments?.[0] ?? DOCS_INDEX_SLUG
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDocsPage(resolveSlug(slug))
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } }
  return {
    title: page.title,
    description: page.description,
    robots: { index: false, follow: false },
  }
}

/*
 * A guide is read, not browsed: the same calm column as the component page,
 * the source list on the left, the page's own outline on the right, and the
 * code in window chrome so every listing reads as a file somebody will open.
 */
export default async function RunDocsPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)

  return (
    <main id="main-content" className="run-container pt-14">
      <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <SourceList current={page.href} lead="docs" />

        <div className="min-w-0 xl:grid xl:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] xl:gap-16">
          <article className="min-w-0 pt-12 pb-6 md:pt-20">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#77777c]">
              <Link href={href("/docs")} className="hover:text-[#f5f5f7]">
                Docs
              </Link>
              {section ? (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{section.title}</span>
                </>
              ) : null}
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1] font-semibold tracking-[-0.022em] text-balance">
              {page.title}
            </h1>
            <p className="mt-6 max-w-[38rem] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-[1.45] tracking-[-0.012em] text-pretty text-[#8b8b90]">
              {page.description}
            </p>

            <details className="group mt-8 rounded-[12px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] lg:hidden">
              <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-[14px] text-[#c7c7cc] [&::-webkit-details-marker]:hidden">
                All guides
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-[#77777c] transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="flex flex-col gap-5 px-4 pt-1 pb-4">
                {docsNav.map((group) => (
                  <div key={group.title}>
                    <p className="run-label pb-1.5">{group.title}</p>
                    <ul className="flex flex-col">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={href(item.href)}
                            aria-current={item.slug === page.slug ? "page" : undefined}
                            className="block py-1.5 text-[15px] text-[#8b8b90] aria-[current=page]:text-[#f5f5f7]"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>

            <div className="mt-12 border-t border-white/[0.08] pt-10 md:mt-16 md:pt-12">
              <MDXRemote
                source={source}
                components={runMdxComponents}
                options={{
                  parseFrontmatter: false,
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                  },
                }}
              />
            </div>

            <PrevNext
              className="mt-20"
              label="Documentation navigation"
              previous={previous ? { title: previous.title, href: href(previous.href) } : undefined}
              next={next ? { title: next.title, href: href(next.href) } : undefined}
            />
          </article>

          {toc.length > 0 ? (
            <aside className="hidden xl:block">
              <div className="sticky top-14 pt-20">
                <Toc entries={toc} />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  )
}
