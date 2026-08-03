import Link from "next/link"

import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  /** Omit on the final crumb — it renders as plain text. */
  href?: string
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="label-micro text-muted-foreground/45">
                  /
                </span>
              ) : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "label-micro rounded-sm text-muted-foreground underline-offset-4 transition-colors",
                    "hover:text-foreground hover:underline"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="label-micro text-foreground"
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
