import { notFound } from "next/navigation"

/*
 * Any path the variant does not have lands here, so it gets this variant's
 * not-found — the alert over the desktop — instead of the site's root one.
 */
export default function Missing() {
  notFound()
}
