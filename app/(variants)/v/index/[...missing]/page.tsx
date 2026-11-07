import { notFound } from "next/navigation"

/*
 * Any address under /v/index that no route claims lands here, so the 404 is
 * drawn inside the variant's own frame rather than the site's root one.
 */
export default function IndexMissingPage() {
  notFound()
}
