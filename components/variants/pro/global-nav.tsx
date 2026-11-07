"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, useReducedMotion } from "motion/react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import type { SearchEntry } from "@/lib/search"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import { proHref } from "./href"
import { ProSearch } from "./search"

export interface NavLink {
  label: string
  href: string
}

/*
 * The apple.com global nav: 48px of frosted black, the mark on the left, a
 * single row of 12px links spread across a 1024px measure, search on the
 * right. Below `md` the links fold into a full-screen menu set at 28px.
 */
export function GlobalNav({
  links,
  components,
  searchIndex,
}: {
  links: NavLink[]
  components: NavLink[]
  searchIndex: SearchEntry[]
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // A route change closes the menu, whatever caused it.
  const [lastPath, setLastPath] = React.useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  const isActive = (href: string) => {
    if (href === proHref("/docs")) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="pro-globalnav-wrap sticky top-0 z-[100]">
      <header className="pro-globalnav relative">
        <nav
          aria-label="Global"
          className="mx-auto flex h-12 max-w-[1024px] items-center justify-between gap-2 px-4 sm:px-[22px]"
        >
          <Link
            href={proHref("/")}
            className="-ml-2 flex h-11 items-center gap-2 rounded-md px-2 text-[#f5f5f7] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2997ff]"
          >
            <LogoMark className="size-[18px]" />
            <span className="text-[14px] font-semibold tracking-[-0.02em]">
              Join UI
            </span>
          </Link>

          <ul className="hidden flex-1 items-center justify-evenly md:flex">
            {links.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center rounded-md px-2 text-[12px] tracking-[-0.01em] transition-colors duration-300",
                      "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2997ff]",
                      active ? "text-white" : "text-[#e8e8ed]/80 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="-mr-2 flex items-center">
            <ProSearch index={searchIndex} />
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Join UI on GitHub (opens in a new tab)"
              className="hidden h-11 w-10 items-center justify-center rounded-full text-[#e8e8ed]/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2997ff] md:flex"
            >
              <GitHubIcon aria-hidden="true" className="size-[16px]" />
            </a>

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open the menu"
                  className="flex h-11 w-10 cursor-pointer items-center justify-center rounded-full text-[#e8e8ed] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2997ff] md:hidden"
                >
                  <MenuGlyph open={false} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Content
                  aria-describedby={undefined}
                  className="v-pro dark fixed inset-0 z-[150] overflow-y-auto bg-[rgb(0_0_0/0.94)] backdrop-blur-2xl md:hidden"
                >
                  <Dialog.Title className="sr-only">Menu</Dialog.Title>
                  <div className="flex h-12 items-center justify-between px-4">
                    <Dialog.Close asChild>
                      <Link
                        href={proHref("/")}
                        className="-ml-2 flex h-11 items-center gap-2 rounded-md px-2 text-[#f5f5f7] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2997ff]"
                      >
                        <LogoMark className="size-[18px]" />
                        <span className="text-[14px] font-semibold tracking-[-0.02em]">
                          Join UI
                        </span>
                      </Link>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close the menu"
                        className="-mr-2 flex h-11 w-10 cursor-pointer items-center justify-center rounded-full text-[#e8e8ed] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2997ff]"
                      >
                        <MenuGlyph open />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="px-8 pt-4 pb-28">
                    <MobileMenu
                      links={links}
                      components={components}
                      isActive={isActive}
                    />
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </nav>
      </header>
    </div>
  )
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3 w-[18px]">
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "top-[5px] rotate-45" : "top-[2px]"
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "top-[5px] -rotate-45" : "top-[8px]"
        )}
      />
    </span>
  )
}

function MobileMenu({
  links,
  components,
  isActive,
}: {
  links: NavLink[]
  components: NavLink[]
  isActive: (href: string) => boolean
}) {
  const reduce = useReducedMotion()

  const item = (index: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            delay: 0.04 + index * 0.025,
            duration: 0.32,
            ease: [0.4, 0, 0.6, 1] as const,
          },
        }

  return (
    <nav aria-label="Menu">
      <ul className="flex flex-col">
        {links.map((link, index) => (
          <motion.li key={link.href} {...item(index)}>
            <Dialog.Close asChild>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="block rounded-md py-1.5 text-[28px] leading-[1.15] font-semibold tracking-[-0.03em] text-[#e8e8ed] hover:text-white focus-visible:outline-2 focus-visible:outline-[#2997ff]"
              >
                {link.label}
              </Link>
            </Dialog.Close>
          </motion.li>
        ))}
      </ul>

      <motion.p
        {...item(links.length)}
        className="mt-10 text-[12px] font-semibold text-[#86868b]"
      >
        Components
      </motion.p>
      <ul className="mt-2 flex flex-col">
        {components.map((link, index) => (
          <motion.li key={link.href} {...item(links.length + 1 + index)}>
            <Dialog.Close asChild>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="block rounded-md py-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[#e8e8ed] hover:text-white focus-visible:outline-2 focus-visible:outline-[#2997ff]"
              >
                {link.label}
              </Link>
            </Dialog.Close>
          </motion.li>
        ))}
      </ul>

      <motion.div {...item(links.length + components.length + 1)} className="mt-10">
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-md text-[17px] text-[#2997ff] focus-visible:outline-2 focus-visible:outline-[#2997ff]"
        >
          <GitHubIcon aria-hidden="true" className="size-4" />
          Source on GitHub
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </motion.div>
    </nav>
  )
}
