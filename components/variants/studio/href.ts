import { variantHref } from "@/lib/variants"

/** Rewrites a site path so it stays inside the Studio variant. */
export function sh(href: string): string {
  return variantHref("studio", href)
}

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/** Catalog link for a category, in the slug form the catalog reads. */
export function categoryHref(name: string): string {
  return sh(`/components?category=${categorySlug(name)}`)
}
