import { notFound } from "next/navigation"

/*
 * Any address under the variant that no route claims lands on the variant's
 * own "Plate missing" page rather than on the site-wide 404.
 */
export default function MissingPlate() {
  notFound()
}
