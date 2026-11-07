import { variantHref } from "@/lib/variants"

/*
 * Client-safe helpers. Nothing here imports the registry, so a client
 * component can use them without pulling every component's metadata into the
 * browser bundle.
 */

export const VARIANT = "gallery" as const

/** Every internal link goes through here so it stays inside the variant. */
export function g(href: string): string {
  return variantHref(VARIANT, href)
}

export function categoryHref(category: string): string {
  return g(`/components?category=${encodeURIComponent(category)}`)
}

/** The real slug of a (possibly scale-test) item, for previews and links. */
export function realSlug(slug: string): string {
  return slug.split("~")[0] ?? slug
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** `2026-09-10` → `Sep 10, 2026`, without a locale-dependent formatter. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return iso
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
