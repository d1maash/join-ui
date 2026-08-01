import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { cache } from "react"
import GithubSlugger from "github-slugger"

const DOCS_DIR = path.join(process.cwd(), "content", "docs")

export interface TocEntry {
  id: string
  title: string
  level: 2 | 3
}

/**
 * Reads a docs page.
 *
 * Page titles and descriptions live in `lib/docs/nav.ts`, so the MDX files hold
 * nothing but content — there is no frontmatter to keep in sync.
 */
export const getDocContent = cache(async (slug: string): Promise<string | null> => {
  // `slug` comes from a fixed allow-list in `docsSlugs`, but normalise anyway.
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "")
  try {
    return await fs.readFile(path.join(DOCS_DIR, `${safeSlug}.mdx`), "utf8")
  } catch {
    return null
  }
})

const FENCE = /^(?:```|~~~)/

/**
 * Builds the on-page table of contents from `##` and `###` headings.
 *
 * Uses the same `github-slugger` instance semantics as `rehype-slug`, so the
 * anchors generated here always match the ids rehype puts on the headings.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger()
  const entries: TocEntry[] = []
  let insideFence = false

  for (const line of markdown.split("\n")) {
    if (FENCE.test(line.trim())) {
      insideFence = !insideFence
      continue
    }
    if (insideFence) continue

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const hashes = match[1]
    const rawTitle = match[2]
    if (!hashes || !rawTitle) continue

    // Strip inline markdown so the TOC reads as plain text.
    const title = rawTitle
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim()

    entries.push({
      id: slugger.slug(title),
      title,
      level: hashes.length === 2 ? 2 : 3,
    })
  }

  return entries
}
