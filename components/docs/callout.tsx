import * as React from "react"
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"

import { cn } from "@/lib/utils"

type CalloutType = "note" | "tip" | "warning" | "success"

const STYLES: Record<
  CalloutType,
  { icon: typeof Info; wrapper: string; icon_: string; srLabel: string }
> = {
  note: {
    icon: Info,
    wrapper: "border-border bg-muted/50",
    icon_: "text-muted-foreground",
    srLabel: "Note",
  },
  tip: {
    icon: Lightbulb,
    wrapper: "border-primary/25 bg-primary-soft/50",
    icon_: "text-primary",
    srLabel: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-warning/30 bg-warning/8",
    icon_: "text-warning",
    srLabel: "Warning",
  },
  success: {
    icon: CheckCircle2,
    wrapper: "border-success/30 bg-success/8",
    icon_: "text-success",
    srLabel: "Success",
  },
}

export interface CalloutProps extends React.ComponentPropsWithoutRef<"aside"> {
  type?: CalloutType
  title?: string
}

/**
 * Highlighted aside. The type is announced through a visually hidden label so
 * the distinction is not carried by colour and icon alone.
 */
export function Callout({
  type = "note",
  title,
  className,
  children,
  ...props
}: CalloutProps) {
  const style = STYLES[type]
  const Icon = style.icon

  return (
    <aside
      className={cn(
        "my-5 flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        style.wrapper,
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", style.icon_)} />
      <div className="flex min-w-0 flex-col gap-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <span className="sr-only">{style.srLabel}:</span>
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        <div className="text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8125rem] [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </aside>
  )
}
