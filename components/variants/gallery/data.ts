import { docsNav } from "@/lib/docs/nav"
import { allComponents, componentsByName, getCategorySummaries } from "@/lib/registry"
import { toCatalogItem, type CatalogItem } from "@/lib/registry/catalog"
import type { ComponentMetadata } from "@/types/registry"

import { categoryHref, g } from "./links"

export { categoryHref, formatDate, g, realSlug, VARIANT } from "./links"

/*
 * Gallery — the data layer (server only: it reads the full registry).
 * ---------------------------------------------------------------------------
 * Every surface in this variant is projected from the registry through the
 * helpers below: the rail, the rails of cards, the category tiles, the
 * catalog, the workbench. Nothing is written per component, so a new entry in
 * `lib/registry/components.ts` shows up everywhere on its own.
 */

/** The card a rail, a grid or a related row renders. */
export interface GalleryItem extends CatalogItem {
  /** The more recent of `since` and `updated` — what "new" sorts by. */
  touched: string
}

export function toGalleryItem(component: ComponentMetadata): GalleryItem {
  return { ...toCatalogItem(component), touched: component.updated ?? component.since }
}

/**
 * Scale test multiplier. Kept at 1 — the rails, the catalog and the rail were
 * verified at 20 (≈140 items).
 */
const SCALE = 1

function scaled<T extends { slug: string; title: string }>(items: T[]): T[] {
  if (SCALE <= 1) return items
  return Array.from({ length: SCALE }, (_, round) =>
    items.map((item) =>
      round === 0
        ? item
        : { ...item, slug: `${item.slug}~${round}`, title: `${item.title} ${round + 1}` }
    )
  ).flat()
}

export function getGalleryItems(): GalleryItem[] {
  return scaled(allComponents.map(toGalleryItem))
}

/** "New & noteworthy": newest first by the later of entry and rework. */
export function getNoteworthy(limit = 12): GalleryItem[] {
  return [...getGalleryItems()]
    .sort((a, b) => b.touched.localeCompare(a.touched) || a.title.localeCompare(b.title))
    .slice(0, limit)
}

/** "Featured": the registry's own flag, in catalog order. */
export function getFeatured(limit = 12): GalleryItem[] {
  return getGalleryItems()
    .filter((item) => item.featured)
    .slice(0, limit)
}

export interface NavComponent {
  slug: string
  title: string
  badge?: "New" | "Updated"
}

export interface NavCategory {
  name: string
  count: number
  href: string
  items: NavComponent[]
}

export interface NavDocsSection {
  title: string
  items: Array<{ slug: string; title: string; href: string; label?: string }>
}

export interface GalleryNav {
  total: number
  newCount: number
  updatedCount: number
  categories: NavCategory[]
  docs: NavDocsSection[]
}

function navBadge(component: ComponentMetadata): NavComponent["badge"] {
  if (component.status === "new") return "New"
  if (component.updated || component.status === "updated") return "Updated"
  return undefined
}

/** The rail: categories that have something in them, then the guides. */
export function getGalleryNav(): GalleryNav {
  const named = scaled(
    componentsByName.map((component) => ({
      slug: component.slug,
      title: component.title,
      category: component.category as string,
      badge: navBadge(component),
    }))
  )

  const categories = getCategorySummaries()
    .filter((summary) => summary.count > 0)
    .map((summary) => {
      const items = named
        .filter((item) => item.category === summary.name)
        .map(({ slug, title, badge }) => ({ slug, title, badge }))
      return {
        name: summary.name,
        count: items.length,
        href: categoryHref(summary.name),
        items,
      }
    })

  return {
    total: named.length,
    newCount: named.filter((item) => item.badge === "New").length,
    updatedCount: named.filter((item) => item.badge === "Updated").length,
    categories,
    docs: docsNav.map((section) => ({
      title: section.title,
      items: section.items.map((page) => ({
        slug: page.slug,
        title: page.title,
        href: g(page.href),
        label: page.label,
      })),
    })),
  }
}

/** Category tiles on the landing page — only categories with members. */
export function getCategoryTiles() {
  const items = getGalleryItems()
  return getCategorySummaries()
    .filter((summary) => summary.count > 0)
    .map((summary) => {
      const members = items.filter((item) => item.category === summary.name)
      return {
        name: summary.name,
        count: members.length,
        href: categoryHref(summary.name),
        example: members[0],
        members,
      }
    })
}
