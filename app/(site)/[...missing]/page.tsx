import { notFound } from "next/navigation"

/*
 * Any address under the variant that no route claims lands here, so the 404
 * renders inside the site's own shell rather than the bare root one.
 */
export default function MissingPage() {
  notFound()
}
