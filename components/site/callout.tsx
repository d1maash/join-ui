import type * as React from "react"
import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Each variant gets one of the semantic hue families, drawn as a tinted panel
 * with a matching left rule. The tint is the accelerator — the icon and the
 * spelled-out label are what actually carry the severity, so the block still
 * works for a reader who cannot separate amber from red.
 */
const VARIANTS = {
  note: {
    icon: Info,
    label: "Note",
    surface: "border-info/20 bg-info-soft border-l-info",
    accent: "text-info",
  },
  tip: {
    icon: CheckCircle2,
    label: "Tip",
    surface: "border-positive/20 bg-positive-soft border-l-positive",
    accent: "text-positive",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    surface: "border-caution/25 bg-caution-soft border-l-caution",
    accent: "text-caution",
  },
  danger: {
    icon: Ban,
    label: "Careful",
    surface: "border-critical/25 bg-critical-soft border-l-critical",
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
        "my-5 flex gap-3 rounded-lg border border-l-[3px] p-4",
        surface,
        className
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", accent)} />
      <div className="min-w-0 flex-1">
        <p className={cn("label-caps mb-1.5", accent)}>{title ?? label}</p>
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/80 [&>p]:my-0">
          {children}
        </div>
      </div>
    </aside>
  )
}
