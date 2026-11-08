import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { ContributeLinks, DocHeader, PrevNext } from "@/components/variants/studio/doc-parts"
import { sh } from "@/components/variants/studio/href"
import { studioMdx } from "@/components/variants/studio/mdx"
import { MobileToc, Toc } from "@/components/variants/studio/toc"
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
  if (!page || (slug?.length ?? 0) > 1) return { title: "Page not found", robots: { index: false } }
  return {
    title: page.title,
    description: page.description,
    robots: { index: false, follow: false },
  }
}

export default async function StudioDocsPage({ params }: PageProps) {
  const { slug } = await params
  if ((slug?.length ?? 0) > 1) notFound()
  const resolved = resolveSlug(slug)
  const page = getDocsPage(resolved)
  if (!page) notFound()

  const source = await getDocContent(resolved)
  if (source === null) notFound()

  const toc = extractToc(source)
  const section = getSectionForSlug(resolved)
  const siblings = getDocsSiblings(resolved)
  const previous = siblings.previous
    ? { title: siblings.previous.title, href: sh(siblings.previous.href) }
    : undefined
  const next = siblings.next ? { title: siblings.next.title, href: sh(siblings.next.href) } : undefined

  const fileUrl = `${siteConfig.links.repo}/blob/main/content/docs/${resolved}.mdx`
  const issueUrl = `${siteConfig.links.issues}/new?title=${encodeURIComponent(`[Docs: ${page.title}] `)}`

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:gap-12">
      <main id="main-content" className="min-w-0 pt-8 pb-8">
        <MobileToc items={toc} />
        <article className="max-w-[46rem]">
          <DocHeader
            crumbs={[
              { label: "Docs", href: sh("/docs") },
              ...(section ? [{ label: section.title }] : []),
              { label: page.title },
            ]}
            title={page.title}
            description={page.description}
            markdown={`# ${page.title}\n\n${page.description}\n\n${source}`}
            previous={previous}
            next={next}
          />
          <div className="st-prose mt-10">
            <MDXRemote
              source={source}
              components={studioMdx}
              options={{
                parseFrontmatter: false,
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, rehypeCodeMeta],
                },
              }}
            />
          </div>
          <PrevNext previous={previous} next={next} />
        </article>
      </main>
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-8 xl:block">
        <Toc items={toc}>
          <ContributeLinks editUrl={fileUrl} issueUrl={issueUrl} />
        </Toc>
      </aside>
    </div>
  )
}
