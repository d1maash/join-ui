import { promises as fs } from "node:fs"
import path from "node:path"

import { components } from "@/lib/registry/components"
import { siteConfig } from "@/lib/site"
import type { ComponentMetadata, Registry, RegistryItem } from "@/types/registry"

export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json"
export const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

const projectRoot = process.cwd()

/** Registry item without file contents — used for the index. */
export type RegistryIndexItem = Omit<RegistryItem, "$schema" | "files"> & {
  files: Array<{
    path: string
    type: RegistryItem["files"][number]["type"]
    target: string
  }>
}

function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

function baseItem(component: ComponentMetadata) {
  return {
    name: component.slug,
    type: "registry:ui" as const,
    title: component.title,
    description: component.description,
    author: siteConfig.author,
    dependencies: component.dependencies,
    registryDependencies: component.registryDependencies,
    categories: [categorySlug(component.category), ...component.tags],
    docs: `${siteConfig.url}/components/${component.slug}`,
    meta: {
      status: component.status,
      since: component.since,
      featured: component.featured,
      installCommand: component.installCommand,
    },
  }
}

/** Index entry: everything except the file bodies. */
export function toIndexItem(component: ComponentMetadata): RegistryIndexItem {
  return {
    ...baseItem(component),
    files: component.files.map((file) => ({
      path: file.path,
      type: file.type,
      target: file.target,
    })),
    ...(component.cssVars ? { cssVars: component.cssVars } : {}),
  }
}

/** Full item, with each file's source inlined for the CLI to write. */
export async function toRegistryItem(
  component: ComponentMetadata
): Promise<RegistryItem> {
  const files = await Promise.all(
    component.files.map(async (file) => ({
      path: file.path,
      type: file.type,
      target: file.target,
      content: await fs.readFile(path.join(projectRoot, file.path), "utf8"),
    }))
  )

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    ...baseItem(component),
    files,
    ...(component.cssVars ? { cssVars: component.cssVars } : {}),
  }
}

/** The `registry.json` shadcn's own `build` command consumes. */
export function buildSourceRegistry(): Registry {
  return {
    $schema: REGISTRY_SCHEMA,
    name: siteConfig.registryName,
    homepage: siteConfig.url,
    // Same shape as an index entry — the CLI inlines file contents itself.
    items: components.map(toIndexItem),
  }
}

/** The public index served at `/r/registry.json`. */
export function buildRegistryIndex() {
  return {
    $schema: REGISTRY_SCHEMA,
    name: siteConfig.registryName,
    homepage: siteConfig.url,
    items: components.map(toIndexItem),
  }
}
