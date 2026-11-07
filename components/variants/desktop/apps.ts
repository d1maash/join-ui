import { variantHref } from "@/lib/variants"

/*
 * The apps of the toy OS.
 *
 * Every component is an app; so are the catalog (a Finder), the docs (a
 * reader), the terminal and GitHub. This file is the one list the menu bar,
 * the Dock, the home screen and Spotlight all read, and it deliberately holds
 * no registry data — the server passes titles and categories down, so the
 * client bundle never imports the registry.
 */

export const COMPONENT_SLUGS = [
  "approval-gate",
  "tool-trace",
  "agent-hive",
  "status-timeline",
  "focus-stack",
  "glass-crest",
  "carbon-copy",
] as const

export type ComponentSlug = (typeof COMPONENT_SLUGS)[number]

export type SystemAppId = "catalog" | "docs" | "terminal" | "github" | "about"

export type AppId = ComponentSlug | SystemAppId

export function isComponentSlug(value: string): value is ComponentSlug {
  return (COMPONENT_SLUGS as readonly string[]).includes(value)
}

/** What the server tells the client about each component. */
export interface ComponentInfo {
  slug: ComponentSlug
  title: string
  category: string
  description: string
  installCommand: string
}

/** Label under a home-screen icon, where a full title would truncate. */
export const SHORT_NAME: Record<AppId, string> = {
  "approval-gate": "Approval",
  "tool-trace": "Tool Trace",
  "agent-hive": "Agent Hive",
  "status-timeline": "Timeline",
  "focus-stack": "Focus Stack",
  "glass-crest": "Glass Crest",
  "carbon-copy": "Carbon Copy",
  catalog: "Catalog",
  docs: "Docs",
  terminal: "Terminal",
  github: "GitHub",
  about: "Join UI",
}

export const SYSTEM_NAME: Record<SystemAppId, string> = {
  catalog: "Catalog",
  docs: "Docs",
  terminal: "Terminal",
  github: "GitHub",
  about: "About Join UI",
}

/*
 * Finder tags, one per category. The four categories the registry uses today
 * get the four tag colours that read best on dark glass; anything added later
 * falls back to grey rather than to a guess.
 */
export const CATEGORY_TAG: Record<string, string> = {
  Feedback: "#ff9f0a",
  "Data Display": "#0a84ff",
  Marketing: "#bf5af2",
  "Text Effects": "#30d158",
}

export function tagColour(category: string): string {
  return CATEGORY_TAG[category] ?? "#98989d"
}

export const vh = (href: string) => variantHref("desktop", href)
