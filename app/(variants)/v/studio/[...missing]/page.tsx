import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/*
 * Any address under the variant that no route claims lands on Studio's own
 * not-found page rather than on the site-wide 404.
 */
export default function Missing() {
  notFound()
}
