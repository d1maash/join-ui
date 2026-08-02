"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { SidebarSection } from "@/lib/docs/sidebar"
import { cn } from "@/lib/utils"

/**
 * Documentation navigation.
 *
 * Sections are separated by rules and labelled in mono caps; the active page is
 * marked by an ink rule on the left edge rather than a filled pill.
 */
export function Sidebar({
  sections,
  onNavigate,
  className,
}: {
  sections: SidebarSection[]
  /** Called after a link is activated — used to close the mobile drawer. */
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  if (sections.length === 0) return null

  return (
    <nav aria-label="Documentation" className={cn("flex flex-col", className)}>
      {sections.map((section) => (
        <div key={section.title} className="border-b border-border py-5 last:border-b-0">
          <p className="label-caps mb-3 text-muted-foreground">{section.title}</p>
          <ul className="flex flex-col">
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 border-l-2 py-1.5 pl-3 text-sm",
                      "transition-colors duration-[var(--duration-fast)]",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.label ? (
                      <span className="label-caps shrink-0 text-muted-foreground">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
