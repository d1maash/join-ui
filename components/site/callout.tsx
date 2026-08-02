import type * as React from "react"
import { AlertTriangle, Ban, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const VARIANTS = {
  note: { icon: Info, label: "Note", rule: "border-l-border-strong" },
  tip: { icon: CheckCircle2, label: "Tip", rule: "border-l-border-strong" },
  warning: { icon: AlertTriangle, label: "Warning", rule: "border-l-foreground" },
  danger: { icon: Ban, label: "Careful", rule: "border-l-foreground" },
} as const

export type CalloutVariant = keyof typeof VARIANTS

/**
 * Aside block.
 *
 * Severity is signalled by the icon and the spelled-out label; the left rule
 * thickens for the two serious variants. Nothing depends on hue.
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
  const { icon: Icon, label, rule } = VARIANTS[variant]
  const serious = variant === "warning" || variant === "danger"

  return (
    <aside
      className={cn(
        "my-5 flex gap-3 border border-border bg-subtle p-4",
        serious ? "border-l-2" : "border-l-2",
        rule,
        className
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", serious ? "text-foreground" : "text-muted-foreground")}
      />
      <div className="min-w-0 flex-1">
        <p className="label-caps mb-1.5 text-muted-foreground">{title ?? label}</p>
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground [&>p]:my-0">
          {children}
        </div>
      </div>
    </aside>
  )
}
