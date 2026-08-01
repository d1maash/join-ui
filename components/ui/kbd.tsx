import * as React from "react"

import { cn } from "@/lib/utils"

export function Kbd({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[0.6875rem] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
