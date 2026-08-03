"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { SidebarSection } from "@/lib/docs/sidebar"
import { cn } from "@/lib/utils"

/**
 * Documentation navigation.
 *
 * Sections are separated by rules and labelled in mono caps. The active page is
 * a white chip lifted off the warm rail by a hairline and the lightest shadow —
 * the same material cue the cards use, rather than a colour the rail does not
 * otherwise contain.
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
          <p className="label-micro mb-3 text-muted-foreground">{section.title}</p>
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
                      "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm",
                      "transition-colors duration-[var(--duration-fast)]",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "border-border bg-card font-medium text-foreground shadow-xs"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.label ? (
                      <span className="label-micro shrink-0 text-muted-foreground">
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
