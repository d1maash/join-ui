"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Menu } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { GalleryLogo, Rail } from "@/components/variants/gallery/rail"
import { SearchField, SearchIconButton } from "@/components/variants/gallery/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import type { GalleryNav } from "@/components/variants/gallery/data"
import { g } from "@/components/variants/gallery/links"

/** The rail, as a sheet, for anything narrower than a laptop. */
export function MobileMenu({ nav, className }: { nav: GalleryNav; className?: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className={cn("g-icon-btn -ml-1.5 cursor-pointer", className)}
        >
          <Menu aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[18rem] border-[var(--g-line)] bg-[var(--g-bg)] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Every category and guide in the library.
        </SheetDescription>
        <Rail nav={nav} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

function useCrumbs(nav: GalleryNav) {
  const pathname = usePathname()
  return React.useMemo(() => {
    const components = g("/components")
    const docs = g("/docs")
    const crumbs: Array<{ label: string; href?: string }> = []

    if (pathname === components) {
      crumbs.push({ label: "Components" })
    } else if (pathname.startsWith(`${components}/`)) {
      const slug = pathname.slice(components.length + 1)
      const category = nav.categories.find((entry) => entry.items.some((item) => item.slug === slug))
      const item = category?.items.find((entry) => entry.slug === slug)
      crumbs.push({ label: "Components", href: components })
      if (category && item) {
        crumbs.push({ label: category.name, href: category.href })
        crumbs.push({ label: item.title })
      } else {
        crumbs.push({ label: "Not found" })
      }
    } else if (pathname === docs || pathname.startsWith(`${docs}/`)) {
      const href = pathname === docs ? g("/docs/introduction") : pathname
      const section = nav.docs.find((entry) => entry.items.some((item) => item.href === href))
      const page = section?.items.find((item) => item.href === href)
      crumbs.push({ label: "Docs", href: docs })
      if (section && page) {
        crumbs.push({ label: section.title })
        crumbs.push({ label: page.title })
      } else {
        crumbs.push({ label: "Not found" })
      }
    } else {
      crumbs.push({ label: "Library", href: components })
      crumbs.push({ label: "Not found" })
    }
    return crumbs
  }, [nav, pathname])
}

function Crumbs({ nav, className }: { nav: GalleryNav; className?: string }) {
  const crumbs = useCrumbs(nav)
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-[0.8125rem]">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="truncate rounded-sm text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("truncate", last ? "text-[var(--g-ink)]" : "text-[var(--g-ink-3)]")}
                >
                  {crumb.label}
                </span>
              )}
              {!last ? (
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-[var(--g-ink-4)]" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function GitHubLink({ className }: { className?: string }) {
  return (
    <a
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer noopener"
      className={cn("g-icon-btn", className)}
    >
      <GitHubIcon aria-hidden="true" />
      <span className="sr-only">GitHub (opens in a new tab)</span>
    </a>
  )
}

/** The bar above every library page: where you are, search on small screens, GitHub, install. */
export function LibraryTopBar({ nav }: { nav: GalleryNav }) {
  return (
    <header className="sticky top-0 z-40 flex h-[var(--g-top)] items-center gap-3 border-b border-[var(--g-line)] bg-[rgb(9_9_11/0.82)] px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-5 lg:px-6">
      <MobileMenu nav={nav} className="lg:hidden" />
      <GalleryLogo className="lg:hidden" />
      <Crumbs nav={nav} className="hidden lg:block" />
      <div className="ml-auto flex items-center gap-1">
        <SearchField label="Search" className="hidden h-8 w-56 md:flex lg:hidden" />
        <SearchIconButton className="md:hidden" />
        <Link href={g("/docs")} className="g-btn g-btn-ghost hidden h-8 px-2.5 sm:inline-flex">
          Docs
        </Link>
        <GitHubLink />
        <Link href={g("/docs/installation")} className="g-btn g-btn-accent ml-1.5 h-8 px-3">
          Install
        </Link>
      </div>
    </header>
  )
}
