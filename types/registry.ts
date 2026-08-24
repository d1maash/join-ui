/**
 * Shared content model for Join UI.
 *
 * Every surface of the site — catalog card, component page, navigation,
 * search index, install command, `/r/*.json` registry item and the AI prompt —
 * is derived from a single `ComponentMetadata` record. Nothing here is
 * duplicated by hand anywhere else.
 */

export const COMPONENT_CATEGORIES = [
  "Buttons",
  "Navigation",
  "Cards",
  "Forms",
  "Data Display",
  "Feedback",
  "Overlays",
  "Text Effects",
  "Backgrounds",
  "Layout",
  "Marketing",
  "Experimental",
] as const

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

export const COMPONENT_STATUSES = ["stable", "new", "updated", "experimental"] as const

export type ComponentStatus = (typeof COMPONENT_STATUSES)[number]

/** Facets exposed by the catalog filter bar. */
export const COMPONENT_TRAITS = ["animated", "accessible", "zero-deps"] as const

export type ComponentTrait = (typeof COMPONENT_TRAITS)[number]

/** shadcn registry item file kinds used by this registry. */
export type RegistryFileType =
  | "registry:ui"
  | "registry:lib"
  | "registry:hook"
  | "registry:component"
  | "registry:file"

export interface RegistryFile {
  /** Path inside this repository, relative to the project root. */
  path: string
  /** Destination inside the consumer's project. */
  target: string
  type: RegistryFileType
}

export interface PropDefinition {
  name: string
  type: string
  defaultValue?: string
  required?: boolean
  description: string
}

/** Props are grouped so a registry item can document more than one export. */
export interface PropGroup {
  /** Exported symbol the props belong to, e.g. `MorphingTabs`. */
  name: string
  description?: string
  props: PropDefinition[]
}

export interface KeyboardInteraction {
  keys: string[]
  description: string
}

export interface CustomizationExample {
  title: string
  description: string
  code: string
  language?: string
}

export interface ComponentMetadata {
  /** Exported React symbol, e.g. `MagneticButton`. */
  name: string
  /** URL segment and shadcn registry item name, e.g. `magnetic-button`. */
  slug: string
  /** Human title used in headings and registry item `title`. */
  title: string
  /** One-line summary — catalog cards, search, meta description. */
  description: string
  /** Two to four sentences used on the component page and in the AI prompt. */
  overview: string
  category: ComponentCategory
  tags: string[]
  status: ComponentStatus
  featured: boolean
  /** npm packages the component needs. */
  dependencies: string[]
  /** Other registry items (ours or shadcn's) this component pulls in. */
  registryDependencies: string[]
  files: RegistryFile[]
  /** Derived by `defineComponent` — never authored by hand. */
  installCommand: string
  /** Overrides the generated AI prompt when present. */
  prompt?: string
  accessibility: string[]
  keyboard: KeyboardInteraction[]
  props: PropGroup[]
  /** Minimal copy-paste usage snippet. */
  usage: string
  customization: CustomizationExample[]
  /** Slugs of related components. Validated at registry build time. */
  related: string[]
  /** ISO date the component entered the registry. */
  since: string
  /**
   * ISO date of the last change worth telling an installed consumer about —
   * a reworked animation, a new prop, a behaviour that is no longer what their
   * copy of the file does. Set it and every surface says `Updated`; clear it
   * once the change has stopped being news.
   *
   * Deliberately not `status`. Maturity and recency are two different
   * questions — a component can be brand new *and* freshly reworked, or stable
   * for a year and touched yesterday — and folding them into one enum means
   * answering one of them by throwing the other away.
   */
  updated?: string
  /** Optional design tokens the registry item should append to globals.css. */
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}

/** Input shape for `defineComponent` — derived fields are omitted. */
export type ComponentDefinition = Omit<ComponentMetadata, "installCommand">

/** A single shadcn-compatible registry item, as served from `/r/<name>.json`. */
export interface RegistryItem {
  $schema: string
  name: string
  type: RegistryFileType
  title: string
  description: string
  author?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: Array<{
    path: string
    content: string
    type: RegistryFileType
    target: string
  }>
  cssVars?: ComponentMetadata["cssVars"]
  categories?: string[]
  meta?: Record<string, unknown>
  docs?: string
}

/**
 * Source registry (`registry.json` at the repo root) — the input format for
 * `shadcn build`. File bodies are deliberately absent here: the CLI reads them
 * from `path` on disk and inlines them into the published items itself.
 */
export interface Registry {
  $schema: string
  name: string
  homepage: string
  items: Array<
    Omit<RegistryItem, "$schema" | "files"> & {
      files: Array<{ path: string; type: RegistryFileType; target: string }>
    }
  >
}
