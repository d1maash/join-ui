import { notFound } from "next/navigation"

/*
 * Any address under the variant that no route claims lands here, so the 404
 * renders inside the gallery's own shell rather than the site's root one.
 */
export default function GalleryMissingPage() {
  notFound()
}
