import { variantHref } from "@/lib/variants"

/** Every internal link the Air variant builds goes through here. */
export const air = (href: string) => variantHref("air", href)
