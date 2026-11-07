"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Search, X } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import type { SearchEntry } from "@/lib/search"
import { cn } from "@/lib/utils"

import { AirSearch, type QuickLink } from "./search"

export interface NavLinkItem {
  href: string
  label: string
}

/*
 * The global nav. 48px of frosted white, the mark on the left, a handful of
 * small links in the middle, search and GitHub on the right — and on a phone,
 * Apple's two-line menu button that opens a full-screen sheet of large links.
 */
export function AirNavBar({
  base,
  links,
  components,
  searchIndex,
  quickLinks,
  github,
}: {
  base: string
  links: NavLinkItem[]
  components: NavLinkItem[]
  searchIndex: SearchEntry[]
  quickLinks: QuickLink[]
  github: string
}) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const editing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setMenuOpen(false)
        setSearchOpen((value) => !value)
      } else if (event.key === "/" && !editing) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // The most specific link that the current path sits under is the active one.
  const active = React.useMemo(() => {
    const matches = links
      .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
      .sort((a, b) => b.href.length - a.href.length)
    return matches[0]?.href
  }, [links, pathname])

  return (
    <>
      <header className="air-globalnav air-frost z-50 border-b border-[rgb(0_0_0/0.06)]">
        <nav
          aria-label="Global"
          className="mx-auto flex h-12 max-w-[68rem] items-center justify-between gap-6 px-4 sm:px-6"
        >
          <Link
            href={base}
            className="-ml-1 flex shrink-0 items-center gap-2 rounded-md px-1 py-1 text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            <LogoMark className="size-[1.375rem]" />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Join UI</span>
          </Link>

          <ul className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-10">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active === link.href ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-[13px] tracking-[-0.008em] transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
                    active === link.href
                      ? "text-[#1d1d1f]"
                      : "text-[#1d1d1f]/72 hover:text-[#1d1d1f]"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="-mr-2 flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Join UI"
              aria-keyshortcuts="Control+K Meta+K /"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#1d1d1f]/80 transition-colors hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#0071e3]"
            >
              <Search aria-hidden="true" strokeWidth={1.8} className="size-[17px]" />
            </button>
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Join UI on GitHub (opens in a new tab)"
              className="hidden size-10 items-center justify-center rounded-full text-[#1d1d1f]/80 transition-colors hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#0071e3] md:flex"
            >
              <GitHubIcon aria-hidden="true" className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open the menu"
              aria-expanded={menuOpen}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#1d1d1f]/80 hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#0071e3] md:hidden"
            >
              <span aria-hidden="true" className="flex w-[17px] flex-col gap-[6px]">
                <span className="h-[1.5px] rounded-full bg-current" />
                <span className="h-[1.5px] rounded-full bg-current" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AirSearch
        index={searchIndex}
        quickLinks={quickLinks}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Content
            aria-describedby={undefined}
            className="v-air light air-flyout fixed inset-0 z-[70] overflow-y-auto bg-white font-sans text-[#1d1d1f]"
          >
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <div className="flex h-12 items-center justify-between px-4">
              <Link
                href={base}
                onClick={() => setMenuOpen(false)}
                className="-ml-1 flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-2 focus-visible:outline-[#0071e3]"
              >
                <LogoMark className="size-[1.375rem]" />
                <span className="text-[15px] font-semibold tracking-[-0.02em]">Join UI</span>
              </Link>
              <Dialog.Close
                aria-label="Close the menu"
                className="-mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-[#1d1d1f]/80 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#0071e3]"
              >
                <X aria-hidden="true" strokeWidth={1.8} className="size-5" />
              </Dialog.Close>
            </div>

            <div className="px-8 pt-4 pb-28">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setSearchOpen(true)
                }}
                className="air-menu-item flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl bg-[#f5f5f7] px-3.5 text-left text-[17px] text-[#6e6e73] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                style={{ ["--i" as string]: 0 }}
              >
                <Search aria-hidden="true" strokeWidth={1.8} className="size-[18px]" />
                Search Join UI
              </button>

              <nav aria-label="Menu" className="mt-6">
                <ul className="flex flex-col">
                  {links.map((link, index) => (
                    <li
                      key={link.href}
                      className="air-menu-item"
                      style={{ ["--i" as string]: index + 1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active === link.href ? "page" : undefined}
                        className="block rounded-md py-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.028em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p
                  className="air-menu-item mt-10 text-[12px] text-[#6e6e73]"
                  style={{ ["--i" as string]: links.length + 1 }}
                >
                  Components
                </p>
                <ul className="mt-2 flex flex-col">
                  {components.map((link, index) => (
                    <li
                      key={link.href}
                      className="air-menu-item"
                      style={{ ["--i" as string]: links.length + 2 + index }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-md py-1.5 text-[17px] font-semibold tracking-[-0.014em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li
                    className="air-menu-item mt-4"
                    style={{ ["--i" as string]: links.length + 2 + components.length }}
                  >
                    <a
                      href={github}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 rounded-md py-1.5 text-[17px] font-semibold tracking-[-0.014em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                    >
                      <GitHubIcon aria-hidden="true" className="size-4" />
                      GitHub
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
