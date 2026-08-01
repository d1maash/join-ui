import { allComponents, getTraits } from "@/lib/registry"
import type {
  ComponentCategory,
  ComponentMetadata,
  ComponentStatus,
  ComponentTrait,
} from "@/types/registry"

/**
 * The slice of component metadata the catalog actually needs.
 *
 * The full records carry props tables, accessibility notes, usage snippets and
 * customization examples — tens of kilobytes that the client filter never
 * touches. Projecting to this shape keeps the catalog's payload small while
 * still deriving everything from the same source.
 */
export interface CatalogItem {
  slug: string
  title: string
  name: string
  description: string
  category: ComponentCategory
  tags: string[]
  status: ComponentStatus
  traits: ComponentTrait[]
  dependencyCount: number
  featured: boolean
  since: string
}

export function toCatalogItem(component: ComponentMetadata): CatalogItem {
  return {
    slug: component.slug,
    title: component.title,
    name: component.name,
    description: component.description,
    category: component.category,
    tags: component.tags,
    status: component.status,
    traits: getTraits(component),
    dependencyCount: component.dependencies.length,
    featured: component.featured,
    since: component.since,
  }
}

export function getCatalogItems(): CatalogItem[] {
  return allComponents.map(toCatalogItem)
}
