import type { ComponentCategory, ComponentStatus } from "@/types/registry"

/*
 * Plain shapes handed from the server to the client. Nothing in here imports
 * the registry, so a client component can type its props without pulling the
 * component records into the bundle.
 */

/** The one badge a component earns on every surface, if any. */
export type Flag = "new" | "updated" | "experimental"

export interface StudioItem {
  /** Unique per rendered row — equal to `slug` outside the scale test. */
  key: string
  /** The real registry slug, used for thumbnails and previews. */
  slug: string
  href: string
  title: string
  description: string
  category: ComponentCategory
  categorySlug: string
  tags: string[]
  status: ComponentStatus
  flag: Flag | null
  featured: boolean
  since: string
  updated?: string
  dependencies: string[]
}

export interface NavLink {
  key: string
  title: string
  href: string
  flag?: Flag | null
}

export interface NavGroup {
  title: string
  slug: string
  items: NavLink[]
}

export interface NavTree {
  docs: NavGroup[]
  components: NavGroup[]
  total: number
}

export interface TocItem {
  id: string
  title: string
  level: 2 | 3
}

export interface CategoryCount {
  name: ComponentCategory
  slug: string
  count: number
}
