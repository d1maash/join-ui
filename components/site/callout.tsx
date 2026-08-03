import type * as React from "react"
import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Callouts are the one part of the documentation chrome allowed hue, because
 * severity is genuinely information rather than styling.
 *
 * The two quiet variants stay neutral — a "note" is not an event, and tinting
 * it just adds a colour to the page. Only `warning` and `danger` take a family,
 * and even then the tint sits behind an icon and a spelled-out label that carry
 * the meaning on their own.
 */
const VARIANTS = {
  note: {
    icon: Info,
    label: "Note",
    surface: "border-border bg-card border-l-border-strong",
    accent: "text-muted-foreground",
  },
  tip: {
    icon: CheckCircle2,
    label: "Tip",
    surface: "border-border bg-card border-l-border-strong",
    accent: "text-muted-foreground",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    surface: "border-caution/20 bg-caution-soft border-l-caution",
    accent: "text-caution",
  },
  danger: {
    icon: Ban,
    label: "Careful",
    surface: "border-critical/20 bg-critical-soft border-l-critical",
    accent: "text-critical",
  },
} as const

export type CalloutVariant = keyof typeof VARIANTS

/**
 * Aside block.
 *
 * Severity is signalled three ways at once — the icon, the spelled-out label
 * and the tint — so no single channel has to carry it alone.
 */
export function Callout({
  variant = "note",
  title,
  children,
  className,
}: {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const { icon: Icon, label, surface, accent } = VARIANTS[variant]

  return (
    <aside
      className={cn(
        "my-5 flex gap-3 rounded-lg border border-l-2 p-4 shadow-xs",
        surface,
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", accent)} />
      <div className="min-w-0 flex-1">
        <p className={cn("mb-1 text-[0.8125rem] font-semibold tracking-[-0.008em]", accent)}>
          {title ?? label}
        </p>
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/80 [&>p]:my-0">
          {children}
        </div>
      </div>
    </aside>
  )
}
