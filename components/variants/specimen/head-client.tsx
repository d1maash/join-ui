"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"

const BASE = variantHref("specimen", "/")

const NAV = [
  { href: variantHref("specimen", "/components"), label: "Plates" },
  { href: variantHref("specimen", "/docs"), label: "Manual" },
]

function isCurrent(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function HeadNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="sp-navlink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface PlateRef {
  slug: string
  no: string
  title: string
}

/*
 * The middle of the running head: which plate this is, and which part of it
 * the reader has scrolled to. Sections opt in with `data-running="Label"`.
 * It repeats what the headings already say, so it is hidden from assistive
 * technology rather than announced on every scroll.
 */
export function RunningTitle({ plates }: { plates: PlateRef[] }) {
  const pathname = usePathname()
  const [section, setSection] = React.useState<string | null>(null)

  const plate = React.useMemo(() => {
    const match = /\/components\/([^/?#]+)/.exec(pathname)
    return match ? plates.find((entry) => entry.slug === match[1]) : undefined
  }, [pathname, plates])

  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-running]"))
    if (nodes.length === 0) return
    const visible = new Map<Element, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target, entry.isIntersecting)
        const current = nodes.find((node) => visible.get(node))
        setSection(current ? (current.dataset.running ?? null) : null)
      },
      { rootMargin: "-30% 0px -65% 0px" }
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [pathname])

  const isCover = pathname === BASE
  const shelf = pathname.startsWith(`${BASE}/docs`)
    ? "Manual"
    : pathname === `${BASE}/components`
      ? "Plates"
      : null

  return (
    <p
      aria-hidden="true"
      className="hidden min-w-0 items-center gap-2.5 truncate md:flex"
    >
      {plate ? (
        <span className="sp-label shrink-0 !text-[var(--sp-ink)]">
          PL. {plate.no} — {plate.title}
        </span>
      ) : isCover ? (
        <span className="sp-label shrink-0 !text-[var(--sp-ink)]">Vol. 1</span>
      ) : shelf ? (
        <span className="sp-label shrink-0 !text-[var(--sp-ink)]">{shelf}</span>
      ) : null}
      {section ? (
        <>
          <span className="size-[5px] shrink-0 rounded-full bg-[var(--sp-signal)]" />
          <span className="sp-label truncate">{section}</span>
        </>
      ) : null}
    </p>
  )
}

interface MenuPlate {
  slug: string
  no: string
  title: string
  category: string
  href: string
}

/** The index, folded, for screens without room for the running head's links. */
export function SpecimenMenu({ plates }: { plates: MenuPlate[] }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const button = React.useRef<HTMLButtonElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const panelId = React.useId()
  const [seenPath, setSeenPath] = React.useState(pathname)

  // Close when the route changes, without an effect that sets state.
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    if (open) setOpen(false)
  }

  React.useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>("a")?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="sp-navlink cursor-pointer gap-2"
      >
        <span className="sp-label !text-[var(--sp-ink)]">{open ? "Close" : "Index"}</span>
        <span aria-hidden="true" className="relative block h-2.5 w-4">
          <span
            className={cn(
              "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300",
              open && "translate-y-[5px] rotate-45"
            )}
          />
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300",
              open && "-translate-y-[4px] -rotate-45"
            )}
          />
        </span>
      </button>

      <div
        ref={panel}
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--sp-head)] bottom-0 z-50 overflow-y-auto border-t border-[var(--sp-rule)] bg-[var(--sp-paper)]"
      >
        <nav aria-label="Index" className="sp-wrap py-6">
          <p className="sp-label">Plates</p>
          <ol className="mt-3 border-t border-[var(--sp-ink)]">
            {plates.map((plate) => (
              <li key={plate.slug} className="border-b border-[var(--sp-rule)]">
                <Link
                  href={plate.href}
                  aria-current={pathname === plate.href ? "page" : undefined}
                  className="flex items-baseline gap-4 py-3.5"
                >
                  <span className="sp-mono w-7 text-[12px] text-[var(--sp-ink-2)]">
                    {plate.no}
                  </span>
                  <span className="text-[22px] font-semibold tracking-[-0.02em]">
                    {plate.title}
                  </span>
                  <span className="sp-label ml-auto">{plate.category}</span>
                </Link>
              </li>
            ))}
          </ol>
          <ul className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-[28px] font-semibold tracking-[-0.025em]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
