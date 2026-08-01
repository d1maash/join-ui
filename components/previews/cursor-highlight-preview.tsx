"use client"

import { BarChart3, Boxes, CreditCard, Settings2, Users } from "lucide-react"

import { CursorHighlight } from "@/registry/components/cursor-highlight"

const ITEMS = [
  { label: "Overview", icon: Boxes },
  { label: "Analytics", icon: BarChart3 },
  { label: "Members", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings2 },
]

export default function CursorHighlightPreview() {
  return (
    <div className="w-full max-w-sm">
      <CursorHighlight padding={4} radius={10} className="rounded-xl border border-border bg-card p-2">
        <p className="px-3 pb-2 pt-1 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <nav aria-label="Workspace sections" className="flex flex-col">
          {ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              data-highlight
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </CursorHighlight>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Point at an item — or press <kbd className="font-mono">Tab</kbd> to walk
        through them.
      </p>
    </div>
  )
}
