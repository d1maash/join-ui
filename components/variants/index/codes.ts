import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
  type ComponentStatus,
  type ComponentTrait,
} from "@/types/registry"

/*
 * Index codes
 * ---------------------------------------------------------------------------
 * Every component wears a code — `FB-02`, `DD-01` — made of its category's
 * two-letter mark and its place in that category, counted in the order the
 * components entered the registry. Counting by `since` rather than by name is
 * what keeps a code stable: a new component takes the next number in its
 * category and never renumbers the ones before it.
 *
 * The marks for the categories that exist today are a vocabulary, like the
 * names themselves. A category added to `COMPONENT_CATEGORIES` later gets one
 * derived from its name (initials for two words, first letter + first strong
 * consonant for one), so nothing here has to be touched for it to work.
 */
const MARKS: Partial<Record<ComponentCategory, string>> = {
  Buttons: "BT",
  Navigation: "NV",
  Cards: "CD",
  Forms: "FM",
  "Data Display": "DD",
  Feedback: "FB",
  Overlays: "OV",
  "Text Effects": "TX",
  Backgrounds: "BG",
  Layout: "LY",
  Marketing: "MK",
  Experimental: "EX",
}

function deriveMark(name: string, taken: Set<string>): string {
  const letters = name.toUpperCase().replace(/[^A-Z ]/g, "")
  const words = letters.split(" ").filter(Boolean)
  const candidates: string[] = []
  if (words.length > 1) candidates.push(`${words[0]![0]}${words[1]![0]}`)
  const flat = words.join("")
  for (const char of flat.slice(1)) {
    if (!"AEIOU".includes(char)) candidates.push(`${flat[0]}${char}`)
  }
  for (const char of flat.slice(1)) candidates.push(`${flat[0]}${char}`)
  return candidates.find((mark) => !taken.has(mark)) ?? flat.slice(0, 2)
}

export const CATEGORY_MARKS: Record<string, string> = (() => {
  const taken = new Set<string>()
  const out: Record<string, string> = {}
  for (const name of COMPONENT_CATEGORIES) {
    const preferred = MARKS[name]
    const mark = preferred && !taken.has(preferred) ? preferred : deriveMark(name, taken)
    taken.add(mark)
    out[name] = mark
  }
  return out
})()

export function categoryMark(category: string): string {
  return CATEGORY_MARKS[category] ?? deriveMark(category, new Set(Object.values(CATEGORY_MARKS)))
}

/** URL-safe handle for a category, used for anchors on the index. */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

export type IxBadge = "New" | "Updated" | "Experimental"

/**
 * The one flag a row has room for. Recency beats maturity: a component that is
 * new is news before it is anything else.
 */
export function badgeFor(item: { status: ComponentStatus; updated?: string }): IxBadge | null {
  if (item.status === "new") return "New"
  if (item.updated || item.status === "updated") return "Updated"
  if (item.status === "experimental") return "Experimental"
  return null
}

/** The interaction word in a cell's meta row, read off the metadata. */
export function interactionWord(keyboardCount: number, traits: ComponentTrait[]): string {
  if (keyboardCount > 0) return "interactive"
  if (traits.includes("animated")) return "animated"
  return "static"
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}
