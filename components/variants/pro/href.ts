import { variantHref } from "@/lib/variants"

/** Every internal link in the Pro variant goes through here. */
export function proHref(path: string): string {
  return variantHref("pro", path)
}
