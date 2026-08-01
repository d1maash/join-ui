import { docsPages } from "@/lib/docs/nav"
import { allComponents, getCategorySummaries } from "@/lib/registry"

export type SearchGroup = "Components" | "Documentation" | "Categories"

export interface SearchEntry {
  id: string
  title: string
  description: string
  href: string
  group: SearchGroup
  /** Extra terms matched by the scorer but not displayed. */
  keywords: string[]
  /** Rendered as a trailing chip in the result row. */
  badge?: string
}

/**
 * The search index is derived from the registry and the docs outline, so it can
 * never drift from what actually exists. It is small enough (tens of entries)
 * to ship to the client and query synchronously — no external service, no
 * network request, works offline.
 */
export function buildSearchIndex(): SearchEntry[] {
  const components: SearchEntry[] = allComponents.map((component) => ({
    id: `component:${component.slug}`,
    title: component.title,
    description: component.description,
    href: `/components/${component.slug}`,
    group: "Components",
    keywords: [
      component.name,
      component.slug,
      component.category,
      component.status,
      ...component.tags,
    ],
    badge: component.category,
  }))

  const docs: SearchEntry[] = docsPages.map((page) => ({
    id: `doc:${page.slug}`,
    title: page.title,
    description: page.description,
    href: page.href,
    group: "Documentation",
    keywords: [page.slug, "docs", "guide"],
  }))

  const categories: SearchEntry[] = getCategorySummaries()
    .filter((category) => category.count > 0)
    .map((category) => ({
      id: `category:${category.slug}`,
      title: category.name,
      description: `${category.count} component${category.count === 1 ? "" : "s"}`,
      href: `/components?category=${encodeURIComponent(category.name)}`,
      group: "Categories",
      keywords: [category.slug, "category", "filter"],
    }))

  return [...components, ...docs, ...categories]
}

function normalize(value: string): string {
  return value.toLowerCase().trim()
}

/**
 * Scores an entry against a query.
 *
 * Deliberately simple and predictable: exact prefix beats word-boundary match,
 * which beats a substring hit in the description, which beats a keyword hit.
 * Returns 0 when any query token is unmatched, so multi-word queries narrow
 * rather than widen.
 */
function score(entry: SearchEntry, tokens: string[]): number {
  const title = normalize(entry.title)
  const description = normalize(entry.description)
  const keywords = entry.keywords.map(normalize)

  let total = 0

  for (const token of tokens) {
    let best = 0

    if (title === token) best = 120
    else if (title.startsWith(token)) best = 90
    else if (new RegExp(`\\b${escapeRegExp(token)}`).test(title)) best = 70
    else if (title.includes(token)) best = 50

    if (best === 0) {
      if (keywords.some((keyword) => keyword === token)) best = 40
      else if (keywords.some((keyword) => keyword.includes(token))) best = 25
    }

    if (best === 0 && description.includes(token)) best = 15

    if (best === 0) return 0
    total += best
  }

  // Nudge components above docs when scores tie — they are what people look for.
  if (entry.group === "Components") total += 4
  return total
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function searchIndex(
  index: SearchEntry[],
  query: string,
  limit = 12
): SearchEntry[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  return index
    .map((entry) => ({ entry, value: score(entry, tokens) }))
    .filter((result) => result.value > 0)
    .sort((a, b) => b.value - a.value || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((result) => result.entry)
}

export const SEARCH_GROUP_ORDER: SearchGroup[] = [
  "Components",
  "Documentation",
  "Categories",
]

export function groupResults(
  results: SearchEntry[]
): Array<{ group: SearchGroup; entries: SearchEntry[] }> {
  return SEARCH_GROUP_ORDER.map((group) => ({
    group,
    entries: results.filter((entry) => entry.group === group),
  })).filter((section) => section.entries.length > 0)
}
