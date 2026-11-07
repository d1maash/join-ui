"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowUpRight, Menu, Search, X } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import type { SearchEntry } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"

import { RunSearch } from "./search"
import { TONE_COLOR, TONE_LABEL, useRunTone } from "./state"

const href = (path: string) => variantHref("run", path)

interface NavComponent {
  slug: string
  title: string
}

/*
 * The chrome. Transparent over the hero, so the first thing on the page is the
 * statement and the window; a dark translucent material once anything has
 * scrolled under it. The wordmark carries the run's status light — the one
 * piece of chrome that changes colour, and only because the run did.
 */
export function RunTopBar({
  searchIndex,
  components,
}: {
  searchIndex: SearchEntry[]
  components: NavComponent[]
}) {
  const pathname = usePathname()
  const tone = useRunTone()
  const [scrolled, setScrolled] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isComponents = pathname.startsWith(href("/components"))
  const isDocs = pathname.startsWith(href("/docs"))
  const lit = tone !== "idle"

  return (
    <header className="run-topbar" data-scrolled={scrolled || menuOpen}>
      <div className="run-container flex h-full items-center gap-2">
        <Link
          href={href("/")}
          className="-ml-1 flex items-center gap-2.5 rounded-lg px-1 py-1"
          aria-label={`${siteConfig.name} — home`}
        >
          <LogoMark className="size-[22px] text-[#f5f5f7]" />
          <span className="text-[15px] font-semibold tracking-[-0.012em]">
            Join<span className="font-normal text-[#8b8b90]"> UI</span>
          </span>
          <span
            className="run-pip ml-0.5"
            style={
              { "--run-state-solid": lit ? TONE_COLOR[tone] : undefined } as React.CSSProperties
            }
            aria-hidden="true"
            title={`Run: ${TONE_LABEL[tone]}`}
          />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden md:block">
          <ul className="flex items-center gap-0.5">
            <li>
              <Link
                href={href("/components")}
                className="run-navlink"
                aria-current={isComponents ? "page" : undefined}
              >
                Components
              </Link>
            </li>
            <li>
              <Link
                href={href("/docs")}
                className="run-navlink"
                aria-current={isDocs ? "page" : undefined}
              >
                Docs
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            className="run-search-trigger hidden md:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search aria-hidden="true" className="size-3.5" />
            <span className="pr-6">Search</span>
            <kbd aria-label="Command K">
              <span aria-hidden="true">⌘</span>K
            </kbd>
          </button>
          <button
            type="button"
            className="run-btn run-btn--ghost run-btn--icon md:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search aria-hidden="true" />
          </button>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="run-btn run-btn--ghost run-btn--icon hidden md:inline-flex"
            aria-label="GitHub (opens in a new tab)"
          >
            <GitHubIcon aria-hidden="true" />
          </a>

          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="run-btn run-btn--ghost run-btn--icon -mr-2 md:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden="true" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Content
                className="run-portal run-sheet fixed inset-0 z-[160] flex flex-col overflow-y-auto bg-black"
                aria-describedby={undefined}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <div className="flex h-14 shrink-0 items-center justify-between px-4">
                  <Link
                    href={href("/")}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <LogoMark className="size-[22px]" />
                    <span className="text-[15px] font-semibold">
                      Join<span className="font-normal text-[#8b8b90]"> UI</span>
                    </span>
                  </Link>
                  <Dialog.Close
                    className="-mr-2 flex size-9 items-center justify-center rounded-lg text-[#8b8b90] hover:text-white"
                    aria-label="Close menu"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </Dialog.Close>
                </div>

                <nav aria-label="Menu" className="flex flex-1 flex-col px-4 pt-6 pb-24">
                  <ul className="flex flex-col">
                    {[
                      { label: "Components", to: href("/components") },
                      { label: "Docs", to: href("/docs") },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="block py-2 text-[34px] leading-[1.15] font-semibold tracking-[-0.022em]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <a
                        href={siteConfig.links.github}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2 py-2 text-[34px] leading-[1.15] font-semibold tracking-[-0.022em] text-[#8b8b90]"
                      >
                        GitHub
                        <ArrowUpRight aria-hidden="true" className="size-6" />
                      </a>
                    </li>
                  </ul>

                  <p className="mt-10 mb-2 text-[13px] text-[#77777c]">The seven</p>
                  <ul className="grid grid-cols-2 gap-x-4">
                    {components.map((component) => (
                      <li key={component.slug}>
                        <Link
                          href={href(`/components/${component.slug}`)}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "block py-2 text-[17px] text-[#c7c7cc] hover:text-white",
                            pathname.endsWith(`/${component.slug}`) && "text-white"
                          )}
                        >
                          {component.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <RunSearch index={searchIndex} open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
