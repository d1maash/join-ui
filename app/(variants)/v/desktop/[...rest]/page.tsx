import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/*
 * Any path the variant does not have lands here, so it gets this variant's
 * not-found — the alert over the desktop — instead of the site's root one.
 */
export default function Missing() {
  notFound()
}
