import { notFound } from "next/navigation"

/*
 * Any address under the variant that no route claims lands on Studio's own
 * not-found page rather than on the site-wide 404.
 */
export default function Missing() {
  notFound()
}
