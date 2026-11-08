import { docsNav } from "@/lib/docs/nav"
import { allComponents, getTraits } from "@/lib/registry"
import { buildSearchIndex } from "@/lib/search"
import { variantHref } from "@/lib/variants"
import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type ComponentMetadata,
  type ComponentStatus,
  type ComponentTrait,
} from "@/types/registry"

import { badgeFor, categoryMark, interactionWord, type IxBadge } from "./codes"

/*
 * Everything the Index variant draws is projected here from the registry, once,
 * on the server. Client components receive these small records and never
 * import the registry itself.
 */

export const IX = "index" as const

export const ixHref = (href: string) => variantHref(IX, href)

export interface IxItem {
  /** React key. Equal to `slug` for real data. */
  id: string
  slug: string
  title: string
  description: string
  category: ComponentCategory
  code: string
  hint: string
  status: ComponentStatus
  badge: IxBadge | null
  updated?: string
  since: string
  deps: string[]
  traits: ComponentTrait[]
  tags: string[]
}

/**
 * The registry in code order. Codes are counted per category in order of
 * arrival, so they are assigned over the oldest-first list and then the
 * projection is returned newest-first, the catalog's default.
 */
function project(components: ComponentMetadata[]): IxItem[] {
  const oldestFirst = [...components].sort(
    (a, b) => a.since.localeCompare(b.since) || a.title.localeCompare(b.title)
  )
  const counters = new Map<string, number>()
  const codes = new Map<ComponentMetadata, string>()
  for (const component of oldestFirst) {
    const next = (counters.get(component.category) ?? 0) + 1
    counters.set(component.category, next)
    codes.set(component, `${categoryMark(component.category)}-${String(next).padStart(2, "0")}`)
  }

  return [...components]
    .sort((a, b) => b.since.localeCompare(a.since) || a.title.localeCompare(b.title))
    .map((component) => {
      const traits = getTraits(component)
      return {
        id: component.slug,
        slug: component.slug,
        title: component.title,
        description: component.description,
        category: component.category,
        code: codes.get(component) ?? "",
        hint: `${component.tags[0] ?? component.category.toLowerCase()} · ${interactionWord(
          component.keyboard.length,
          traits
        )}`,
        status: component.status,
        badge: badgeFor(component),
        ...(component.updated ? { updated: component.updated } : {}),
        since: component.since,
        deps: component.dependencies,
        traits,
        tags: component.tags,
      }
    })
}

let cache: IxItem[] | null = null

export function getIxItems(): IxItem[] {
  cache ??= project(allComponents)
  return cache
}

export function getIxItem(slug: string): IxItem | undefined {
  return getIxItems().find((item) => item.slug === slug)
}

export interface IxCategory {
  name: ComponentCategory
  mark: string
  count: number
  /** In code order. */
  items: IxItem[]
}

export function getIxCategories(): IxCategory[] {
  const items = getIxItems()
  return COMPONENT_CATEGORIES.map((name) => {
    const inCategory = items
      .filter((item) => item.category === name)
      .sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }))
    return { name, mark: categoryMark(name), count: inCategory.length, items: inCategory }
  }).filter((category) => category.count > 0)
}

export interface IxNavLink {
  title: string
  href: string
  label?: string
}

export interface IxNavComponent {
  id: string
  slug: string
  title: string
  code: string
  href: string
  badge: IxBadge | null
}

export interface IxNav {
  docs: Array<{ title: string; items: IxNavLink[] }>
  groups: Array<{ name: string; mark: string; items: IxNavComponent[] }>
  total: number
}

export function getIxNav(): IxNav {
  return {
    docs: docsNav.map((section) => ({
      title: section.title,
      items: section.items.map((page) => ({
        title: page.title,
        href: ixHref(page.href),
        ...(page.label ? { label: page.label } : {}),
      })),
    })),
    groups: getIxCategories().map((category) => ({
      name: category.name,
      mark: category.mark,
      items: category.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        code: item.code,
        href: ixHref(`/components/${item.slug}`),
        badge: item.badge,
      })),
    })),
    total: getIxItems().length,
  }
}

export interface IxSearchEntry {
  id: string
  title: string
  description: string
  href: string
  group: "Components" | "Documentation" | "Categories"
  keywords: string[]
  badge?: string
  /** Index code for components, category mark for categories. */
  code?: string
}

export function getIxSearchIndex(): IxSearchEntry[] {
  const codes = new Map(getIxItems().map((item) => [item.slug, item.code]))
  return buildSearchIndex().map((entry) => {
    const slug = entry.id.startsWith("component:") ? entry.id.slice("component:".length) : null
    const category = entry.id.startsWith("category:") ? entry.title : null
    const code = slug ? codes.get(slug) : category ? categoryMark(category) : undefined
    return {
      ...entry,
      href: variantHref(IX, entry.href),
      keywords: code ? [...entry.keywords, code.toLowerCase()] : entry.keywords,
      ...(code ? { code } : {}),
    }
  })
}

/** The most recent date anything in the registry changed. */
export function getLastChange(): string | null {
  let latest: string | null = null
  for (const item of getIxItems()) {
    for (const date of [item.since, item.updated]) {
      if (date && (!latest || date > latest)) latest = date
    }
  }
  return latest
}
