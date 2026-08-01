"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface HeaderNavLinkProps {
  href: string
  children: React.ReactNode
}

/**
 * Top-level nav link that knows whether its section is active.
 *
 * Split out of the header so the header itself stays a Server Component —
 * `usePathname` is the only reason any of this needs to run on the client.
 */
export function HeaderNavLink({ href, children }: HeaderNavLinkProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-sm transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}
