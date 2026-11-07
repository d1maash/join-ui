import { componentsByName } from "@/lib/registry"
import { variantHref } from "@/lib/variants"
import type { ComponentMetadata } from "@/types/registry"

/*
 * Plate numbers follow the reading order of the manual, which is the order the
 * previous / next links already walk: alphabetical. Agent Hive is PL. 01, Tool
 * Trace is PL. 07, and the number a reader sees on the contents page is the one
 * printed in the running head of the plate itself.
 */

export interface PlateIndexEntry {
  slug: string
  no: string
  title: string
  category: string
  description: string
  status: string
  href: string
}

export function plateNo(slug: string): string {
  const index = componentsByName.findIndex((component) => component.slug === slug)
  return String(index + 1).padStart(2, "0")
}

export function toPlate(component: ComponentMetadata): PlateIndexEntry {
  return {
    slug: component.slug,
    no: plateNo(component.slug),
    title: component.title,
    category: component.category,
    description: component.description,
    status: component.status,
    href: variantHref("specimen", `/components/${component.slug}`),
  }
}

export function getPlateIndex(): PlateIndexEntry[] {
  return componentsByName.map(toPlate)
}

/** The one line a contents row carries — shorter than the catalog description. */
export const PURPOSE: Record<string, string> = {
  "agent-hive": "Pick a model from a comb of glass, and watch the runs it dispatches.",
  "approval-gate": "An agent asks to run a command. A person answers with Y or N.",
  "carbon-copy": "A headline that is set, then copied, with the changed words turning over.",
  "focus-stack": "A coil of pills that keeps one item in focus while the rest twist away.",
  "glass-crest": "A hero led by an arc of tinted glass discs that answers the pointer.",
  "status-timeline": "Where a run, an order or an onboarding stands. Still until it advances.",
  "tool-trace": "The tool calls of an agent run, each opening, writing, folding away.",
}

export const href = (path: string) => variantHref("specimen", path)
