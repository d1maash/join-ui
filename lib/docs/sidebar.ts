import { docsNav } from "@/lib/docs/nav"
import { componentsByName } from "@/lib/registry"
import { COMPONENT_CATEGORIES } from "@/types/registry"

export interface SidebarLink {
  title: string
  href: string
  label?: string
}

export interface SidebarSection {
  title: string
  items: SidebarLink[]
}

/**
 * One navigation tree for the whole documentation area — guides first, then
 * every component grouped by category.
 *
 * Both halves are projected from existing sources (`docsNav` and the registry),
 * so a new component or guide appears in the sidebar without touching this file.
 */
export function getSidebarSections(): SidebarSection[] {
  const guides: SidebarSection[] = docsNav.map((section) => ({
    title: section.title,
    items: section.items.map((page) => ({
      title: page.title,
      href: page.href,
      label: page.label,
    })),
  }))

  const categories: SidebarSection[] = COMPONENT_CATEGORIES.map((category) => ({
    title: category,
    items: componentsByName
      .filter((component) => component.category === category)
      .map((component) => ({
        title: component.title,
        href: `/components/${component.slug}`,
        label:
          component.status === "new"
            ? "New"
            : component.status === "updated"
              ? "Updated"
              : undefined,
      })),
  })).filter((section) => section.items.length > 0)

  return [...guides, ...categories]
}
