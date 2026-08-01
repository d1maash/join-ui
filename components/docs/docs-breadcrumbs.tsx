import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  href?: string
}

export interface DocsBreadcrumbsProps {
  items: Crumb[]
  className?: string
}

/**
 * Breadcrumb trail. The final crumb is the current page, so it is plain text
 * carrying `aria-current="page"` rather than a link to itself.
 */
export function DocsBreadcrumbs({ items, className }: DocsBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "font-medium text-foreground")}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground/60"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
