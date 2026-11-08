/*
 * Client-safe helpers. Nothing here imports the registry, so a client
 * component can use them without pulling every component's metadata into the
 * browser bundle.
 */

export function categoryHref(category: string): string {
  return `/components?category=${encodeURIComponent(category)}`
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** `2026-09-10` → `Sep 10, 2026`, without a locale-dependent formatter. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return iso
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
