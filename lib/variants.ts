/*
 * Design variants
 * ---------------------------------------------------------------------------
 * The Apple-style redesign is being explored as several complete versions of
 * the site, side by side, so one can be chosen by using it rather than by
 * looking at a mock-up. Each variant lives under `/v/<id>` and renders every
 * route the real site has — landing, catalog, component pages and docs — from
 * the same registry and MDX content.
 *
 * Nothing outside `app/(variants)` and `components/variants` depends on this
 * file. Once a variant is chosen it is promoted to the root routes and this
 * whole layer is deleted.
 */

export type VariantId = "index" | "studio" | "gallery"

export interface Variant {
  id: VariantId
  name: string
  /** One line for the chooser. */
  tagline: string
  /** What it borrows from. */
  reference: string
  /** The colour scheme the variant renders in by default. */
  scheme: "light" | "dark"
}

export const VARIANTS: Variant[] = [
  {
    id: "index",
    name: "Index",
    tagline: "A precise hairline grid of live components, each one a coded cell you can copy or hand to an agent.",
    reference: "Kokonut UI, Origin UI, Linear",
    scheme: "dark",
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "A calm, neutral documentation-first library with a wall of live primitives and light and dark themes.",
    reference: "shadcn/ui, Animate UI, Magic UI",
    scheme: "light",
  },
  {
    id: "gallery",
    name: "Gallery",
    tagline: "A browsable showroom: rails of live cards, and a split-view workbench for every component.",
    reference: "21st.dev, Aceternity UI, Vercel",
    scheme: "dark",
  },
]

export function getVariant(id: string): Variant | undefined {
  return VARIANTS.find((variant) => variant.id === id)
}

/** The base path every link inside a variant is built on. */
export function variantBase(id: VariantId): string {
  return `/v/${id}`
}

/*
 * Site paths that exist inside every variant. Anything else — `/preview`, the
 * registry JSON under `/r`, an external URL, an in-page `#anchor` — is left as
 * it is, because it means the same thing from every variant.
 */
const SCOPED = /^\/(?:$|components(?:[/?#]|$)|docs(?:[/?#]|$))/

/**
 * Rewrites a site-absolute href so it stays inside the variant.
 *
 *   variantHref("air", "/")                        → "/v/air"
 *   variantHref("air", "/components/focus-stack")  → "/v/air/components/focus-stack"
 *   variantHref("air", "/docs/ai#shape")           → "/v/air/docs/ai#shape"
 *   variantHref("air", "https://github.com/…")     → unchanged
 *   variantHref("air", "/preview/focus-stack")     → unchanged
 */
export function variantHref(id: VariantId, href: string): string {
  if (!SCOPED.test(href)) return href
  const base = variantBase(id)
  return href === "/" ? base : `${base}${href}`
}

/** The inverse, for the switcher: the site path a variant URL stands for. */
export function stripVariant(pathname: string): string {
  const match = /^\/v\/[^/]+(\/.*)?$/.exec(pathname)
  if (!match) return pathname
  return match[1] ?? "/"
}
