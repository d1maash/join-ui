import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { getIxNav, ixHref } from "@/components/variants/index/data"
import { ixMdxComponents } from "@/components/variants/index/mdx"
import { IxCrumbs, IxPager } from "@/components/variants/index/page-parts"
import { IxDocsShell } from "@/components/variants/index/shell"
import { IxToc } from "@/components/variants/index/toc"
import {
  DOCS_INDEX_SLUG,
  docsPages,
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
  if (!page) return { title: "Not found", robots: { index: false } }
  return { title: page.title, description: page.description, robots: { index: false, follow: false } }
}

export default async function IndexDocsPage({ params }: PageProps) {
  const { slug } = await params
  if (slug && slug.length > 1) notFound()
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const { previous, next } = getDocsSiblings(resolved)
  const position = docsPages.findIndex((entry) => entry.slug === resolved) + 1
  const words = source.split(/\s+/).length

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <IxDocsShell
        nav={getIxNav()}
        aside={
          <div className="flex flex-col gap-8">
            <IxToc entries={toc} />
            <div className="flex flex-col gap-1.5">
              <a
                href={`${siteConfig.links.repo}/blob/main/content/docs/${resolved}.mdx`}
                target="_blank"
                rel="noreferrer noopener"
                className="ix-mono ix-fg-3 hover:text-[var(--ix-fg)]"
              >
                Edit this page ↗
              </a>
              <a href={siteConfig.links.issues} target="_blank" rel="noreferrer noopener" className="ix-mono ix-fg-3 hover:text-[var(--ix-fg)]">
                Report an issue ↗
              </a>
            </div>
          </div>
        }
      >
        <header className="ix-rule-b px-5 pt-7 pb-8 md:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <IxCrumbs
              items={[
                { label: "Docs", href: ixHref("/docs") },
                ...(section ? [{ label: section.title }] : []),
                { label: page.title },
              ]}
            />
            <span className="ix-mono ix-fg-3 hidden sm:inline">
              DOC-{String(position).padStart(2, "0")} · {Math.max(1, Math.round(words / 220))} min
            </span>
          </div>
          <h1 className="mt-7 text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.045em] md:text-[2.75rem]">
            {page.title}
          </h1>
          <p className="ix-fg-2 mt-3 max-w-[60ch] text-base leading-relaxed text-pretty">{page.description}</p>
        </header>

        <article className="ix-prose ix-rule-b px-5 py-10 md:px-8 lg:px-12">
          <MDXRemote
            source={source}
            components={ixMdxComponents}
            options={{
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeCodeMeta],
              },
            }}
          />
        </article>

        <IxPager
          label="Documentation navigation"
          previous={previous ? { title: previous.title, href: ixHref(previous.href) } : undefined}
          next={next ? { title: next.title, href: ixHref(next.href) } : undefined}
        />
      </IxDocsShell>
    </main>
  )
}
