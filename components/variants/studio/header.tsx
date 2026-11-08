"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { GitHubIcon } from "@/components/site/icons"
import { LogoMark } from "@/components/site/logo"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import { sh } from "./href"
import { SearchTrigger } from "./search"
import { Sidebar } from "./sidebar"
import { ThemeMenu, ThemeSegmented } from "./theme"
import type { NavTree } from "./types"

export function StudioLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href={sh("/")}
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <LogoMark className="size-[22px]" />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Join UI</span>
    </Link>
  )
}

/**
 * The bar: logo, three destinations, search, GitHub and the theme. Below
 * `lg` the destinations and the whole documentation tree move into a sheet
 * behind the menu button.
 */
export function StudioHeader({ tree, freshCount }: { tree: NavTree; freshCount: number }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const sheetRef = React.useRef<HTMLDivElement>(null)

  const links = [
    { href: sh("/docs"), label: "Docs", active: pathname.startsWith(sh("/docs")) },
    {
      href: sh("/components"),
      label: "Components",
      active: pathname.startsWith(sh("/components")),
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open navigation"
            className="-ml-1.5 flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
          >
            <Menu aria-hidden="true" className="size-[18px]" />
          </SheetTrigger>
          <SheetContent
            ref={sheetRef}
            side="left"
            aria-describedby={undefined}
            // Focus the panel itself, not its first field — on a phone that
            // would open the keyboard over the navigation.
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              sheetRef.current?.focus()
            }}
            className="w-[20rem] bg-background"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
              <StudioLogo onClick={() => setOpen(false)} />
            </div>
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2.5">
              <span className="text-[13px] text-muted-foreground">Theme</span>
              <ThemeSegmented />
            </div>
            <div data-st-scroll className="flex-1 overflow-y-auto overscroll-contain px-3 pt-5 pb-24">
              <nav aria-label="Main" className="mb-6 flex flex-col gap-0.5">
                {[
                  { href: sh("/"), label: "Home" },
                  ...links,
                  { href: sh("/components?show=new"), label: "New & updated" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex h-9 items-center rounded-md px-2 text-[15px] font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Sidebar tree={tree} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <StudioLogo />

        <nav aria-label="Main" className="ml-5 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "flex h-8 items-center rounded-md px-2.5 text-[13.5px] font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-ring",
                link.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={sh("/components?show=new")}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            New
            {freshCount > 0 ? (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-positive-soft px-1 text-[10.5px] font-semibold text-positive tabular-nums">
                {freshCount}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger className="hidden w-60 md:flex xl:w-72" />
          <SearchTrigger variant="icon" className="md:hidden" />
          <a
            href={siteConfig.links.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-1 flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <GitHubIcon aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="sr-only sm:hidden">Join UI on GitHub</span>
          </a>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
          <ThemeMenu />
        </div>
      </div>
    </header>
  )
}
