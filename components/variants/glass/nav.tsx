"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { motion } from "motion/react"
import { Menu, X } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import type { SidebarSection } from "@/lib/docs/sidebar"
import type { SearchEntry } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import { useScrolledPast } from "./hooks"
import { GlassSearch } from "./search"
import { g, LENS_SPRING } from "./ui"

const LINKS = [
  { href: g("/"), label: "Overview", match: (path: string) => path === g("/") },
  {
    href: g("/components"),
    label: "Components",
    match: (path: string) => path.startsWith(g("/components")),
  },
  {
    href: g("/docs"),
    label: "Docs",
    match: (path: string) => path.startsWith(g("/docs")),
  },
]

/**
 * The global navigation: one capsule of glass floating at the top centre, the
 * way a tab bar floats in iOS 26.
 *
 * It condenses once the page moves — a little shorter, a little tighter —
 * and the current section is marked by a lens that slides between links when
 * you navigate, because the capsule lives in the layout and survives the route
 * change. On a phone the links fold into a menu sheet under the capsule.
 */
export function GlassNav({
  search,
  sections,
}: {
  search: SearchEntry[]
  sections: SidebarSection[]
}) {
  const pathname = usePathname()
  const condensed = useScrolledPast(24)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3">
      <nav
        aria-label="Main"
        data-condensed={condensed || undefined}
        className={cn(
          "g-glass pointer-events-auto mt-3 flex w-full max-w-[26rem] items-center gap-1 rounded-full pr-1.5 pl-4 md:w-auto md:max-w-none md:pl-4",
          "h-[52px] transition-[height,margin,box-shadow,--g-fill] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "data-[condensed]:mt-2 data-[condensed]:h-[46px] data-[condensed]:[--g-fill:0.7]"
        )}
      >
        <Link
          href={g("/")}
          className="mr-auto flex shrink-0 items-center gap-2 rounded-full py-1 pr-2 text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] md:mr-0"
        >
          <LogoMark className="size-[22px]" />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            Join UI
          </span>
        </Link>

        <span aria-hidden="true" className="mx-2 hidden h-5 w-px bg-black/10 md:block" />

        <ul className="relative hidden items-center md:flex">
          {LINKS.map((link) => {
            const active = link.match(pathname)
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-9 items-center rounded-full px-4 text-[14px] tracking-[-0.016em] transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
                    active
                      ? "font-medium text-[#1d1d1f]"
                      : "text-[#3a3a3e] hover:text-[#1d1d1f]"
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="g-nav-lens"
                      transition={LENS_SPRING}
                      aria-hidden="true"
                      className="g-lens absolute inset-0 rounded-full"
                    />
                  ) : null}
                  <span className="relative">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <span aria-hidden="true" className="mx-2 hidden h-5 w-px bg-black/10 md:block" />

        <GlassSearch index={search} />

        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Join UI on GitHub (opens in a new tab)"
          className="flex size-9 items-center justify-center rounded-full text-[#3a3a3e] transition-colors hover:bg-black/[0.05] hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          <GitHubIcon aria-hidden="true" className="size-[17px]" />
        </a>

        <MobileMenu sections={sections} pathname={pathname} />
      </nav>
    </header>
  )
}

function MobileMenu({
  sections,
  pathname,
}: {
  sections: SidebarSection[]
  pathname: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open the menu"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] md:hidden"
      >
        <Menu aria-hidden="true" className="size-[19px]" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="v-glass light fixed inset-0 z-[110] bg-[rgb(236_239_247/0.4)] backdrop-blur-[6px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "v-glass light g-glass g-paper fixed inset-x-3 top-3 z-[111] flex max-h-[calc(100dvh-6.5rem)] flex-col overflow-hidden rounded-[30px] font-sans text-[#1d1d1f]",
            "data-[state=open]:animate-pop-in"
          )}
        >
          <div className="flex h-[52px] shrink-0 items-center justify-between pr-1.5 pl-4">
            <Dialog.Title className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
              <LogoMark className="size-[22px]" />
              Join UI
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close the menu"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
            >
              <X aria-hidden="true" className="size-[19px]" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Site navigation, the guides and every component.
          </Dialog.Description>

          <div className="overflow-y-auto overscroll-contain px-6 pt-2 pb-8">
            <ul className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={link.match(pathname) ? "page" : undefined}
                    className="block rounded-xl py-1.5 text-[28px] leading-tight font-semibold tracking-[-0.03em] text-[#1d1d1f] aria-[current=page]:text-[#0066cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-7">
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 text-[13px] font-semibold text-[#56565b]">
                    {section.title}
                  </p>
                  <ul className="flex flex-col">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className="flex items-center justify-between rounded-lg py-1.5 text-[17px] tracking-[-0.02em] text-[#1d1d1f] aria-[current=page]:font-medium aria-[current=page]:text-[#0066cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                        >
                          {item.title}
                          {item.label ? (
                            <span className="text-[12px] font-medium text-[#56565b]">
                              {item.label}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
