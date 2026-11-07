"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { LogoMark } from "@/components/site/logo"

/*
 * Apple puts the breadcrumb at the bottom of the page, in the footer, where it
 * answers "where am I" for someone who has scrolled to the end — rather than
 * at the top, where it competes with the headline. Titles come from the
 * server as a path → title map, so this never imports the registry.
 */
export function FooterCrumbs({
  base,
  titles,
}: {
  base: string
  titles: Record<string, string>
}) {
  const pathname = usePathname()
  const segments = pathname.slice(base.length).split("/").filter(Boolean)
  const trail = segments
    .map((_, index) => `${base}/${segments.slice(0, index + 1).join("/")}`)
    .filter((href) => titles[href])
    .map((href) => ({ href, title: titles[href] as string }))

  return (
    <nav aria-label="Breadcrumb" className="border-b border-[#d2d2d7] pb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#424245]">
        <li className="flex items-center">
          <Link
            href={base}
            className="flex items-center rounded-sm text-[#1d1d1f] hover:text-[#1d1d1f]/80 focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            <LogoMark className="size-4" />
            <span className="sr-only">Join UI</span>
          </Link>
        </li>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="size-3 text-[#86868b]" />
              {last ? (
                <span aria-current="page">{crumb.title}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                >
                  {crumb.title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
