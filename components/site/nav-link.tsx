"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/**
 * Top-level navigation link.
 *
 * The current section is underlined with a 2px ink rule; everything else is
 * plain grey text. `/` only matches exactly so the home link does not stay
 * active across the whole site.
 */
export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-14 items-center border-b-2 px-1 text-sm transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}
