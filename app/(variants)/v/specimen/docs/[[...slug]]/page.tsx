import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { manualComponents } from "@/components/variants/specimen/manual"
import { href } from "@/components/variants/specimen/plates"
import {
  DOCS_INDEX_SLUG,
  docsNav,
  docsPages,
  docsSlugs,
  getDocsPage,
  getDocsSiblings,
  getSectionForSlug,
} from "@/lib/docs/nav"
import { extractToc, getDocContent } from "@/lib/mdx/source"
import { rehypeCodeMeta } from "@/lib/mdx/rehype-code-meta"
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

/** Chapters are numbered in reading order, across every section of the manual. */
function chapterOf(slug: string): number {
  return docsPages.findIndex((page) => page.slug === slug) + 1
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDocsPage(resolveSlug(slug))
  if (!page) return { title: "Chapter not found" }
  return {
    title: `§ ${chapterOf(page.slug)} ${page.title}`,
    description: page.description,
    robots: { index: false, follow: false },
  }
}

export default async function ManualChapter({ params }: PageProps) {
  const { slug } = await params
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const n = chapterOf(resolved)
  const toc = extractToc(source).filter((entry) => entry.level === 2)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)

  const chapters = (
    <ol className="flex flex-col gap-7">
      {docsNav.map((group) => (
        <li key={group.title}>
          <p className="sp-label">{group.title}</p>
          <ol className="mt-2 flex flex-col border-t border-[var(--sp-rule)]">
            {group.items.map((item) => {
              const current = item.slug === resolved
              const number = chapterOf(item.slug)
              return (
                <li key={item.slug} className="border-b border-[var(--sp-rule)]">
                  <Link
                    href={href(item.href)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "group relative flex items-baseline gap-3 py-2 text-[14px] transition-colors",
                      current ? "font-semibold text-[var(--sp-ink)]" : "text-[var(--sp-ink-2)] hover:text-[var(--sp-ink)]"
                    )}
                  >
                    {current ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 -left-3 size-[5px] -translate-y-1/2 rounded-full bg-[var(--sp-signal)]"
                      />
                    ) : null}
                    <span className="sp-mono w-6 shrink-0 text-[11px] font-normal">§{number}</span>
                    <span className="underline-offset-4 group-hover:underline">{item.title}</span>
                  </Link>
                  {current && toc.length > 0 ? (
                    <ol className="mb-3 ml-9 flex flex-col gap-1 border-l border-[var(--sp-rule)] pl-3">
                      {toc.map((entry, index) => (
                        <li key={entry.id}>
                          <a
                            href={`#${entry.id}`}
                            className="flex gap-2 py-0.5 text-[13px] leading-[1.4] text-[var(--sp-ink-2)] hover:text-[var(--sp-ink)]"
                          >
                            <span className="sp-mono shrink-0 text-[11px]">
                              {n}.{index + 1}
                            </span>
                            <span>{entry.title}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </li>
      ))}
    </ol>
  )

  return (
    <main id="main-content" className="sp-wrap pt-8 lg:pt-12">
      <div className="sp-grid gap-y-10">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav
            aria-label="Chapters"
            className="sticky top-[calc(var(--sp-head)+28px)] max-h-[calc(100dvh-var(--sp-head)-56px)] overflow-y-auto pr-4 pb-8 pl-3"
          >
            <p className="sp-label mb-6 !text-[var(--sp-ink)]">The manual</p>
            {chapters}
            <Link
              href={href("/components")}
              className="mt-8 flex items-baseline justify-between border-t border-[var(--sp-ink)] pt-3 text-[14px] font-semibold"
            >
              Index of plates
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </nav>
        </aside>

        <article
          className="sp-article col-span-4 min-w-0 lg:col-span-9 xl:col-span-6"
          style={{ "--chapter": `"${n}"` } as React.CSSProperties}
        >
          <details className="mb-8 border-y border-[var(--sp-ink)] lg:hidden">
            <summary className="sp-label flex cursor-pointer items-center justify-between py-3 !text-[var(--sp-ink)]">
              Chapters
              <span aria-hidden="true">§ {n} / {docsPages.length}</span>
            </summary>
            <div className="pb-6">{chapters}</div>
          </details>

          <header data-running={`§ ${n} — ${page.title}`} className="mb-12">
            <p className="sp-label flex flex-wrap gap-x-3">
              <span className="!text-[var(--sp-ink)]">§ {n}</span>
              {section ? <span>{section.title}</span> : null}
            </p>
            <h1 className="sp-display mt-6 text-[clamp(44px,6vw,84px)] leading-[0.94]">
              {page.title}
            </h1>
            <p className="sp-serif mt-6 max-w-[34ch] text-[clamp(22px,2vw,27px)] leading-[1.25] text-[var(--sp-ink-2)]">
              {page.description}
            </p>
          </header>

          <div className="sp-prose">
            <MDXRemote
              source={source}
              components={manualComponents}
              options={{
                parseFrontmatter: false,
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                },
              }}
            />
          </div>

          <nav aria-label="Chapter navigation" className="mt-20 grid border-y border-[var(--sp-ink)] sm:grid-cols-2">
            {previous ? (
              <ChapterLink
                direction="previous"
                number={chapterOf(previous.slug)}
                title={previous.title}
                target={href(previous.href)}
              />
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <ChapterLink
                direction="next"
                number={chapterOf(next.slug)}
                title={next.title}
                target={href(next.href)}
              />
            ) : (
              <ChapterLink direction="next" title="Index of plates" target={href("/components")} />
            )}
          </nav>
        </article>
      </div>
    </main>
  )
}

function ChapterLink({
  direction,
  number,
  title,
  target,
}: {
  direction: "previous" | "next"
  number?: number
  title: string
  target: string
}) {
  const next = direction === "next"
  return (
    <Link
      href={target}
      className={cn(
        "group flex flex-col gap-3 py-7",
        next ? "items-end text-right sm:pl-6" : "border-b border-[var(--sp-rule)] sm:border-r sm:border-b-0 sm:pr-6"
      )}
    >
      <span className="sp-label flex items-center gap-2">
        {next ? null : (
          <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-x-1" />
        )}
        {next ? "Next chapter" : "Previous chapter"}
        {number ? ` · § ${number}` : ""}
        {next ? (
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-1" />
        ) : null}
      </span>
      <span className="sp-display text-[clamp(26px,2.6vw,36px)] leading-[1]">{title}</span>
    </Link>
  )
}
