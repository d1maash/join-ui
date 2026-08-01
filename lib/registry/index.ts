import { components } from "@/lib/registry/components"
import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type ComponentMetadata,
  type ComponentTrait,
} from "@/types/registry"

export { components }

/** Catalog order: newest first, then alphabetical for stable pagination. */
const byRecency = (a: ComponentMetadata, b: ComponentMetadata) =>
  b.since.localeCompare(a.since) || a.title.localeCompare(b.title)

export const allComponents: ComponentMetadata[] = [...components].sort(byRecency)

/** Navigation order: alphabetical, so the sidebar is scannable. */
export const componentsByName: ComponentMetadata[] = [...components].sort((a, b) =>
  a.title.localeCompare(b.title)
)

const bySlug = new Map(components.map((component) => [component.slug, component]))

export function getComponent(slug: string): ComponentMetadata | undefined {
  return bySlug.get(slug)
}

export function getComponents(slugs: string[]): ComponentMetadata[] {
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((component): component is ComponentMetadata => component !== undefined)
}

export function getFeaturedComponents(limit = 4): ComponentMetadata[] {
  return allComponents.filter((component) => component.featured).slice(0, limit)
}

export function getLatestComponents(limit = 3): ComponentMetadata[] {
  return allComponents.slice(0, limit)
}

export interface CategorySummary {
  name: ComponentCategory
  slug: string
  count: number
  /** One representative component, used for the category card preview. */
  example: ComponentMetadata | undefined
}

export function getCategorySummaries(): CategorySummary[] {
  return COMPONENT_CATEGORIES.map((name) => {
    const inCategory = allComponents.filter(
      (component) => component.category === name
    )
    return {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      count: inCategory.length,
      example: inCategory[0],
    }
  })
}

/**
 * Traits are derived rather than authored, so a component can never claim to be
 * `zero-deps` while listing dependencies.
 */
export function getTraits(component: ComponentMetadata): ComponentTrait[] {
  const traits: ComponentTrait[] = []
  if (component.dependencies.includes("motion") || component.tags.includes("animated")) {
    traits.push("animated")
  }
  if (component.accessibility.length > 0) traits.push("accessible")
  if (component.dependencies.length === 0) traits.push("zero-deps")
  return traits
}

export function hasTrait(
  component: ComponentMetadata,
  trait: ComponentTrait
): boolean {
  return getTraits(component).includes(trait)
}

/** Previous/next in navigation (alphabetical) order. */
export function getSiblings(slug: string): {
  previous: ComponentMetadata | undefined
  next: ComponentMetadata | undefined
} {
  const index = componentsByName.findIndex((component) => component.slug === slug)
  if (index === -1) return { previous: undefined, next: undefined }
  return {
    previous: componentsByName[index - 1],
    next: componentsByName[index + 1],
  }
}

/**
 * Related components: explicit links first, then same-category fallbacks so the
 * section is never empty.
 */
export function getRelated(component: ComponentMetadata, limit = 3): ComponentMetadata[] {
  const explicit = getComponents(component.related)
  if (explicit.length >= limit) return explicit.slice(0, limit)

  const seen = new Set([component.slug, ...explicit.map((item) => item.slug)])
  const fallback = allComponents.filter(
    (candidate) =>
      !seen.has(candidate.slug) && candidate.category === component.category
  )
  return [...explicit, ...fallback].slice(0, limit)
}

/** Every npm package used across the registry — powers the docs dependency list. */
export function getAllDependencies(): string[] {
  const set = new Set<string>()
  for (const component of components) {
    for (const dependency of component.dependencies) set.add(dependency)
  }
  return [...set].sort()
}

export function getRegistryStats() {
  return {
    total: components.length,
    categories: new Set(components.map((component) => component.category)).size,
    zeroDependency: components.filter(
      (component) => component.dependencies.length === 0
    ).length,
  }
}
