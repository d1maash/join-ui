"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { BookOpen, ChevronRight, Home, LayoutGrid, Sparkles } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import { SearchField } from "@/components/site/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import type { GalleryNav } from "@/components/site/data"

/*
 * The library rail.
 * ---------------------------------------------------------------------------
 * Four destinations, then every non-empty category as a collapsible group
 * with its count, then the guides. Groups open on their own when they hold
 * the page you are on; anything you open or close yourself stays that way
 * while you move around, because the rail lives in the layout and is never
 * remounted. A group with forty components costs nothing until it is opened.
 */

export function GalleryLogo({ className }: { className?: string }) {
  return (
    <Link
      href={"/"}
      className={cn("flex shrink-0 items-center gap-2 rounded-md", className)}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--g-ink)] text-[var(--g-bg)]">
        <LogoMark className="size-4" />
      </span>
      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
        Join UI
      </span>
    </Link>
  )
}

function useLocation() {
  const pathname = usePathname()
  const params = useSearchParams()
  return {
    pathname,
    category: params.get("category"),
    status: params.get("status"),
  }
}

export function Rail(props: {
  nav: GalleryNav
  onNavigate?: () => void
  className?: string
}) {
  return (
    <React.Suspense fallback={<RailBody {...props} location={null} />}>
      <RailWithLocation {...props} />
    </React.Suspense>
  )
}

function RailWithLocation(props: {
  nav: GalleryNav
  onNavigate?: () => void
  className?: string
}) {
  const location = useLocation()
  return <RailBody {...props} location={location} />
}

function RailBody({
  nav,
  location,
  onNavigate,
  className,
}: {
  nav: GalleryNav
  location: ReturnType<typeof useLocation> | null
  onNavigate?: () => void
  className?: string
}) {
  const pathname = location?.pathname ?? ""
  const base = "/components"
  const currentSlug = pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length + 1)
    : null
  const onCatalog = pathname === base
  const onDocs = pathname.startsWith("/docs")

  const currentCategory = React.useMemo(() => {
    if (onCatalog && location?.category) return location.category
    if (!currentSlug) return null
    return nav.categories.find((category) =>
      category.items.some((item) => item.slug === currentSlug)
    )?.name
  }, [currentSlug, location?.category, nav.categories, onCatalog])

  const [toggled, setToggled] = React.useState<Record<string, boolean>>({})
  const isOpen = (key: string, fallback: boolean) => toggled[key] ?? fallback
  const toggle = (key: string, fallback: boolean) =>
    setToggled((previous) => ({ ...previous, [key]: !(previous[key] ?? fallback) }))

  const primary = [
    { label: "Home", href: "/", icon: Home, active: pathname === "/" },
    {
      label: "Components",
      href: base,
      icon: LayoutGrid,
      count: nav.total,
      active: onCatalog && !location?.category && !location?.status,
    },
    {
      label: "New",
      href: `${base}?status=new`,
      icon: Sparkles,
      count: nav.newCount,
      active: onCatalog && location?.status === "new",
    },
    { label: "Docs", href: "/docs", icon: BookOpen, active: onDocs },
  ]

  return (
    <nav aria-label="Library" className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex flex-col gap-3 px-3 pt-3.5 pb-2">
        <GalleryLogo className="px-1.5" />
        <SearchField label="Search library" />
      </div>

      <div className="g-thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-6">
        <ul className="flex flex-col gap-px">
          {primary.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "group flex h-8 items-center gap-2.5 rounded-lg px-2 text-[0.8125rem] font-medium transition-colors",
                  item.active
                    ? "bg-[var(--g-panel-3)] text-[var(--g-ink)]"
                    : "text-[var(--g-ink-2)] hover:bg-[var(--g-panel-2)] hover:text-[var(--g-ink)]"
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    item.active ? "text-[var(--g-accent-ink)]" : "text-[var(--g-ink-3)]"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined ? (
                  <span className="g-num text-[0.75rem] text-[var(--g-ink-4)]">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <RailHeading>Categories</RailHeading>
        <ul className="flex flex-col gap-px">
          {nav.categories.map((category) => {
            const fallback = category.name === currentCategory
            const open = isOpen(`c:${category.name}`, fallback)
            const listId = `rail-${category.name.toLowerCase().replace(/\s+/g, "-")}`
            const activeCategory = onCatalog && location?.category === category.name
            return (
              <li key={category.name}>
                <div
                  className={cn(
                    "group flex h-8 items-center rounded-lg transition-colors",
                    activeCategory
                      ? "bg-[var(--g-panel-3)]"
                      : "hover:bg-[var(--g-panel-2)]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(`c:${category.name}`, fallback)}
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-label={`${open ? "Collapse" : "Expand"} ${category.name}`}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--g-ink-4)] hover:text-[var(--g-ink)]"
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        open && "rotate-90"
                      )}
                    />
                  </button>
                  <Link
                    href={category.href}
                    onClick={onNavigate}
                    aria-current={activeCategory ? "page" : undefined}
                    className={cn(
                      "flex h-full min-w-0 flex-1 items-center gap-2 rounded-r-lg pr-2 text-[0.8125rem] transition-colors",
                      activeCategory || fallback
                        ? "text-[var(--g-ink)]"
                        : "text-[var(--g-ink-2)] group-hover:text-[var(--g-ink)]"
                    )}
                  >
                    <span className="flex-1 truncate">{category.name}</span>
                    <span className="g-num text-[0.75rem] text-[var(--g-ink-4)]">
                      {category.count}
                    </span>
                  </Link>
                </div>
                {open ? (
                  <ul
                    id={listId}
                    className="mt-px mb-1.5 ml-4 flex flex-col gap-px border-l border-[var(--g-line)] pl-2"
                  >
                    {category.items.map((item) => {
                      const active = item.slug === currentSlug
                      return (
                        <li key={item.slug}>
                          <Link
                            href={`/components/${item.slug}`}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "relative flex h-7 items-center gap-2 rounded-md px-2 text-[0.8125rem] transition-colors",
                              active
                                ? "bg-[var(--g-accent-soft)] text-[var(--g-ink)]"
                                : "text-[var(--g-ink-3)] hover:bg-[var(--g-panel-2)] hover:text-[var(--g-ink)]"
                            )}
                          >
                            {active ? (
                              <span
                                aria-hidden="true"
                                className="absolute top-1.5 bottom-1.5 -left-[9px] w-px bg-[var(--g-accent)]"
                              />
                            ) : null}
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge ? (
                              <span
                                className={cn(
                                  "text-[0.625rem] font-medium",
                                  item.badge === "New"
                                    ? "text-[var(--g-accent-ink)]"
                                    : "text-[var(--g-ink-4)]"
                                )}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>

        <RailHeading>Documentation</RailHeading>
        <ul className="flex flex-col gap-px">
          {nav.docs.map((section) => {
            const open = isOpen(`d:${section.title}`, onDocs)
            const listId = `rail-docs-${section.title.toLowerCase().replace(/\s+/g, "-")}`
            return (
              <li key={section.title}>
                <button
                  type="button"
                  onClick={() => toggle(`d:${section.title}`, onDocs)}
                  aria-expanded={open}
                  aria-controls={listId}
                  className="group flex h-8 w-full cursor-pointer items-center gap-0 rounded-lg text-left text-[0.8125rem] text-[var(--g-ink-2)] transition-colors hover:bg-[var(--g-panel-2)] hover:text-[var(--g-ink)]"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center text-[var(--g-ink-4)] group-hover:text-[var(--g-ink)]">
                    <ChevronRight
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        open && "rotate-90"
                      )}
                    />
                  </span>
                  <span className="flex-1 truncate">{section.title}</span>
                  <span className="g-num pr-2 text-[0.75rem] text-[var(--g-ink-4)]">
                    {section.items.length}
                  </span>
                </button>
                {open ? (
                  <ul
                    id={listId}
                    className="mt-px mb-1.5 ml-4 flex flex-col gap-px border-l border-[var(--g-line)] pl-2"
                  >
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (pathname === "/docs" && item.slug === "introduction")
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "relative flex h-7 items-center gap-2 rounded-md px-2 text-[0.8125rem] transition-colors",
                              active
                                ? "bg-[var(--g-accent-soft)] text-[var(--g-ink)]"
                                : "text-[var(--g-ink-3)] hover:bg-[var(--g-panel-2)] hover:text-[var(--g-ink)]"
                            )}
                          >
                            {active ? (
                              <span
                                aria-hidden="true"
                                className="absolute top-1.5 bottom-1.5 -left-[9px] w-px bg-[var(--g-accent)]"
                              />
                            ) : null}
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.label ? (
                              <span className="text-[0.625rem] font-medium text-[var(--g-accent-ink)]">
                                {item.label}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--g-line)] px-4 py-3 text-[0.75rem] text-[var(--g-ink-4)]">
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 rounded-md text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
        >
          <GitHubIcon aria-hidden="true" className="size-3.5" />
          d1maash/join-ui
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <span>MIT</span>
      </div>
    </nav>
  )
}

function RailHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 mb-1.5 px-2 text-[0.6875rem] font-medium tracking-[0.01em] text-[var(--g-ink-4)]">
      {children}
    </p>
  )
}
