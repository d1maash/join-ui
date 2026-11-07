import { docsNav, docsPages } from "@/lib/docs/nav"
import { allComponents } from "@/lib/registry"
import { buildSearchIndex, type SearchEntry } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type ComponentMetadata,
} from "@/types/registry"

import { categorySlug, sh } from "./href"
import type { CategoryCount, Flag, NavTree, StudioItem } from "./types"

/*
 * Studio's view of the registry.
 * ---------------------------------------------------------------------------
 * Every surface of the variant — the wall, the category cards, the catalog,
 * the sidebar, search — is projected from `lib/registry` here, on the server,
 * and handed to the client as plain `StudioItem`s. A new entry in
 * `lib/registry/components.ts` appears on all of them with no edit to this
 * folder.
 */

/**
 * Scale test multiplier. Every list below is repeated this many times, with
 * unique keys and the copies spread across all twelve categories, to check
 * that the layout holds at a few hundred components. Keep it at 1.
 */
const SCALE_TEST = 1

export function getFlag(component: Pick<ComponentMetadata, "status" | "updated">): Flag | null {
  if (component.status === "new") return "new"
  if (component.status === "updated" || component.updated) return "updated"
  if (component.status === "experimental") return "experimental"
  return null
}

function toItem(component: ComponentMetadata, copy = 0): StudioItem {
  const category: ComponentCategory =
    copy === 0
      ? component.category
      : (COMPONENT_CATEGORIES[
          (COMPONENT_CATEGORIES.indexOf(component.category) + copy * 5) %
            COMPONENT_CATEGORIES.length
        ] ?? component.category)

  return {
    key: copy === 0 ? component.slug : `${component.slug}~${copy}`,
    slug: component.slug,
    href: sh(`/components/${component.slug}`),
    title: copy === 0 ? component.title : `${component.title} ${copy + 1}`,
    description: component.description,
    category,
    categorySlug: categorySlug(category),
    tags: component.tags,
    status: component.status,
    flag: getFlag(component),
    featured: component.featured,
    since: copy === 0 ? component.since : shiftDate(component.since, -copy * 9),
    ...(component.updated ? { updated: component.updated } : {}),
    dependencies: component.dependencies,
  }
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const byRecency = (a: StudioItem, b: StudioItem) =>
  b.since.localeCompare(a.since) || a.title.localeCompare(b.title)

const byName = (a: StudioItem, b: StudioItem) => a.title.localeCompare(b.title)

/** Every component, newest first (or A–Z). */
export function getItems(order: "recency" | "name" = "recency"): StudioItem[] {
  const items: StudioItem[] = []
  for (let copy = 0; copy < SCALE_TEST; copy++) {
    for (const component of allComponents) items.push(toItem(component, copy))
  }
  return items.sort(order === "name" ? byName : byRecency)
}

/** Non-empty categories in taxonomy order, with counts. */
export function getCategoryCounts(items: StudioItem[] = getItems()): CategoryCount[] {
  return COMPONENT_CATEGORIES.map((name) => ({
    name,
    slug: categorySlug(name),
    count: items.filter((item) => item.category === name).length,
  })).filter((category) => category.count > 0)
}

/** Docs outline plus every component grouped by category, alphabetical inside a group. */
export function getNavTree(): NavTree {
  const items = getItems("name")
  return {
    docs: docsNav.map((section) => ({
      title: section.title,
      slug: categorySlug(section.title),
      items: section.items.map((page) => ({
        key: page.slug,
        title: page.title,
        href: sh(page.href),
        flag: page.label === "New" ? "new" : page.label === "Updated" ? "updated" : null,
      })),
    })),
    components: getCategoryCounts(items).map((category) => ({
      title: category.name,
      slug: category.slug,
      items: items
        .filter((item) => item.category === category.name)
        .map((item) => ({ key: item.key, title: item.title, href: item.href, flag: item.flag })),
    })),
    total: items.length,
  }
}

/** The shared search index with every link kept inside the variant. */
export function getSearchIndex(): SearchEntry[] {
  const base = buildSearchIndex().map((entry) => ({ ...entry, href: sh(entry.href) }))
  if (SCALE_TEST <= 1) return base
  const copies: SearchEntry[] = getItems()
    .filter((item) => item.key !== item.slug)
    .map((item) => ({
      id: `component:${item.key}`,
      title: item.title,
      description: item.description,
      href: item.href,
      group: "Components",
      keywords: [item.slug, item.category, ...item.tags],
      badge: item.category,
    }))
  return [...base, ...copies]
}

export function getDocsCount(): number {
  return docsPages.length
}

/*
 * The wall on the landing page.
 * ---------------------------------------------------------------------------
 * Featured components first, newest first, then the newest of the rest, up
 * to ten. One rule sizes a tile: a featured component that is also new spans
 * two columns, everything else spans one. Rows are packed on a four-column
 * grid, alternating which side the wide tile sits on, and the last row's
 * leftover cells become the "browse everything" tile — so the wall never has
 * a hole, whatever the registry holds.
 */
export type WallTile =
  | { kind: "component"; item: StudioItem; span: 1 | 2 }
  | { kind: "more"; span: number }

export function getWallTiles(limit = 10, columns = 4): WallTile[] {
  const items = getItems()
  const featured = items.filter((item) => item.featured)
  const rest = items.filter((item) => !item.featured)
  const pool = [...featured, ...rest].slice(0, limit)

  const isWide = (item: StudioItem) => item.featured && item.status === "new"
  const wide = pool.filter(isWide)
  const narrow = pool.filter((item) => !isWide(item))

  const rows: WallTile[][] = []
  let w = 0
  let n = 0
  while (w < wide.length || n < narrow.length) {
    const row: WallTile[] = []
    let room = columns
    const pattern: Array<"w" | "n"> =
      narrow.length - n < 2
        ? ["w", "w", "n"]
        : rows.length % 2 === 0
          ? ["w", "n", "n"]
          : ["n", "n", "w"]
    for (const slot of pattern) {
      const nextWide = wide[w]
      const nextNarrow = narrow[n]
      if (slot === "w" && room >= 2 && nextWide) {
        row.push({ kind: "component", item: nextWide, span: 2 })
        w++
        room -= 2
      } else if (slot === "n" && room >= 1 && nextNarrow) {
        row.push({ kind: "component", item: nextNarrow, span: 1 })
        n++
        room -= 1
      }
    }
    // Fill whatever the pattern left: wide tiles first, then narrow ones, and a
    // wide tile shrinks to one column rather than leave a single cell empty.
    for (let next = wide[w]; room >= 2 && next; next = wide[w]) {
      row.push({ kind: "component", item: next, span: 2 })
      w++
      room -= 2
    }
    for (let next = narrow[n] ?? wide[w]; room >= 1 && next; next = narrow[n] ?? wide[w]) {
      row.push({ kind: "component", item: next, span: 1 })
      if (narrow[n]) n++
      else w++
      room -= 1
    }
    rows.push(row)
    if (room > 0) break
  }

  const last = rows[rows.length - 1]
  if (!last) return [{ kind: "more", span: columns }]
  const used = last.reduce((sum, tile) => sum + tile.span, 0)
  if (used < columns) {
    last.push({ kind: "more", span: columns - used })
  } else {
    const dropped = last.pop()
    last.push({ kind: "more", span: dropped?.span ?? 1 })
  }
  return rows.flat()
}

/** `Mar 4, 2026`, from an ISO date, in UTC so the server and client agree. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** The component page as Markdown, for "Copy page". */
export function componentMarkdown(component: ComponentMetadata): string {
  const target = `${siteConfig.namespace}/${component.slug}`
  const props = component.props
    .map((group) => {
      const rows = group.props
        .map(
          (prop) =>
            `| \`${prop.name}\`${prop.required ? " (required)" : ""} | \`${prop.type.replace(/\|/g, "\\|")}\` | ${
              prop.defaultValue ? `\`${prop.defaultValue}\`` : "—"
            } | ${prop.description} |`
        )
        .join("\n")
      return `### ${group.name}\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows}`
    })
    .join("\n\n")

  return [
    `# ${component.title}`,
    component.description,
    component.overview,
    `## Installation\n\n\`\`\`bash\npnpm dlx shadcn@latest add ${target}\n\`\`\``,
    component.dependencies.length > 0
      ? `Dependencies: ${component.dependencies.map((dep) => `\`${dep}\``).join(", ")}`
      : "No npm dependencies.",
    `## Usage\n\n\`\`\`tsx\n${component.usage.trim()}\n\`\`\``,
    `## API reference\n\n${props}`,
    component.accessibility.length > 0
      ? `## Accessibility\n\n${component.accessibility.map((note) => `- ${note}`).join("\n")}`
      : "",
    component.keyboard.length > 0
      ? `## Keyboard\n\n${component.keyboard
          .map((entry) => `- ${entry.keys.join(" + ")}: ${entry.description}`)
          .join("\n")}`
      : "",
    `Source: ${siteConfig.url}/components/${component.slug}`,
  ]
    .filter(Boolean)
    .join("\n\n")
}
