"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import type { SidebarSection } from "@/lib/docs/sidebar"
import { cn } from "@/lib/utils"

export interface DocsSidebarProps {
  sections: SidebarSection[]
  className?: string
  /** Called after a link is activated — used to close the mobile drawer. */
  onNavigate?: () => void
  label?: string
}

/**
 * Documentation navigation.
 *
 * Sections are plain nested lists so the structure is exposed to screen
 * readers, and the current page is marked with `aria-current="page"` rather
 * than by styling alone.
 */
export function DocsSidebar({
  sections,
  className,
  onNavigate,
  label = "Documentation",
}: DocsSidebarProps) {
  const pathname = usePathname()

  return (
    <nav aria-label={label} className={cn("text-sm", className)}>
      <ul className="flex flex-col gap-6">
        {sections.map((section) => (
          <li key={section.title}>
            <h2 className="mb-1.5 px-2 text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
              {section.title}
            </h2>
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem] leading-snug",
                        "transition-colors duration-[var(--duration-fast)]",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                        active
                          ? "bg-primary-soft font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.label ? (
                        <Badge
                          variant={item.label === "New" ? "primary" : "accent"}
                          className="ml-auto shrink-0"
                        >
                          {item.label}
                        </Badge>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
