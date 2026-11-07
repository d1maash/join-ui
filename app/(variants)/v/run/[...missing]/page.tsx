import { notFound } from "next/navigation"

/*
 * Any address under the variant that no route claims lands here, so the 404
 * renders inside this variant's own chrome rather than the site's root one.
 */
export default function RunMissingPage() {
  notFound()
}
