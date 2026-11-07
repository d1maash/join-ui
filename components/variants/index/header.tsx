"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"

import type { IxNav } from "./data"
import { IxNavTree } from "./nav-tree"
import { IxSearchTrigger, usePortal } from "./search"

const LINKS = [
  { href: "/components", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/ai", label: "Agent prompts" },
]

export function IxHeader({ nav }: { nav: IxNav }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const portal = usePortal()

  const active = (href: string) => {
    const full = variantHref("index", href)
    if (href === "/docs") return pathname.startsWith(full) && !pathname.startsWith(`${full}/ai`)
    return pathname === full || pathname.startsWith(`${full}/`)
  }

  return (
    <header className="ix-header backdrop-blur-md backdrop-saturate-150">
      <div className="ix-frame flex h-14 items-center gap-2 px-3 md:px-4">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="ix-icon-btn -ml-1 lg:hidden" aria-label="Open the library">
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          {portal ? (
            <Dialog.Portal container={portal}>
              <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
              <Dialog.Content
                className={cn(
                  "fixed inset-y-0 left-0 z-[81] flex w-[20rem] max-w-[88vw] flex-col border-r border-[var(--ix-line-2)] bg-[var(--ix-bg)] outline-none",
                  "data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left"
                )}
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--ix-line)] px-4">
                  <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
                    <LogoMark className="size-5" />
                    Library
                  </Dialog.Title>
                  <Dialog.Close className="ix-icon-btn -mr-1" aria-label="Close">
                    <X aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Every guide and component in Join UI.
                </Dialog.Description>
                <nav aria-label="Library" data-ix-scroller className="ix-scroll flex-1 overflow-y-auto overscroll-contain">
                  <ul className="grid grid-cols-3 border-b border-[var(--ix-line)]">
                    {LINKS.map((link, index) => (
                      <li key={link.href} className={cn(index > 0 && "border-l border-[var(--ix-line)]")}>
                        <Link
                          href={variantHref("index", link.href)}
                          onClick={() => setOpen(false)}
                          className="flex h-11 items-center justify-center text-[0.8125rem] font-medium text-[var(--ix-fg-2)] hover:text-[var(--ix-fg)]"
                        >
                          {link.label.split(" ")[0]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <IxNavTree nav={nav} onNavigate={() => setOpen(false)} scrollActiveIntoView />
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </Dialog.Root>

        <Link
          href={variantHref("index", "/")}
          className="flex shrink-0 items-center gap-2 rounded-[4px] pr-1 text-[0.9375rem] font-semibold tracking-[-0.02em]"
        >
          <LogoMark className="size-[1.375rem]" />
          {siteConfig.name}
        </Link>

        <span aria-hidden="true" className="mx-3 hidden h-5 w-px bg-[var(--ix-line-2)] lg:block" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={variantHref("index", link.href)}
                  data-active={active(link.href) ? "" : undefined}
                  className="ix-navlink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <IxSearchTrigger className="hidden w-60 md:flex" />
          <IxSearchTrigger variant="icon" className="md:hidden" />
          <span aria-hidden="true" className="mx-1.5 hidden h-5 w-px bg-[var(--ix-line-2)] md:block" />
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="ix-icon-btn -mr-1"
            aria-label={`${siteConfig.name} on GitHub (opens in a new tab)`}
          >
            <GitHubIcon aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}
