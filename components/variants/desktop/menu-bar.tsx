"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as Menu from "@radix-ui/react-dropdown-menu"
import { ArrowUpRight, Check } from "lucide-react"

import { LogoMark } from "@/components/site/logo"
import { siteConfig } from "@/lib/site"

import { AppIcon } from "./app-icon"
import { SYSTEM_NAME, isComponentSlug, vh, type AppId } from "./apps"
import { useNow } from "./hooks"
import { useOs } from "./os"

export interface DocsSection {
  title: string
  items: Array<{ title: string; href: string }>
}

/*
 * The menu bar.
 *
 * Left to right it is the Mac's: the logo menu, the bold name of the app in
 * front, then that app's menus — which here are the site's navigation. On
 * the right, Spotlight, a few drawn status glyphs and the clock. The clock is
 * rendered on the client only, so the server never prints a time that is
 * wrong by the time it arrives.
 */
export function MenuBar({ docs }: { docs: DocsSection[] }) {
  const os = useOs()
  const pathname = usePathname()
  const router = useRouter()

  const slug = /\/components\/([^/?#]+)/.exec(pathname)?.[1]
  const pageComponent = slug && isComponentSlug(slug) ? os.component(slug) : undefined

  const appName = pageComponent
    ? pageComponent.title
    : os.focused
      ? isComponentSlug(os.focused)
        ? (os.component(os.focused)?.title ?? "Join UI")
        : os.focused === "about"
          ? "Join UI"
          : SYSTEM_NAME[os.focused]
      : "Join UI"

  /* A window that lives on the desktop: open it there, going back if need be. */
  const launch = React.useCallback(
    (id: AppId) => {
      if (os.desktopMounted) {
        os.open(id)
      } else {
        os.setPending(id)
        router.push(vh("/"))
      }
    },
    [os, router]
  )

  return (
    <header className="d-menubar" role="banner">
      <nav aria-label="Menu bar" className="flex min-w-0 items-center gap-0.5">
        <Menu.Root modal={false}>
          <Menu.Trigger className="d-mb-item px-2.5" aria-label="Join UI menu">
            <LogoMark className="size-[15px]" />
          </Menu.Trigger>
          <MenuContent>
            <Menu.Item className="d-menu-item" onSelect={() => launch("about")}>
              About Join UI
            </Menu.Item>
            <Menu.Separator className="d-menu-sep" />
            <Menu.Label className="d-menu-label">Wallpaper</Menu.Label>
            <Menu.RadioGroup
              value={os.wallpaper}
              onValueChange={(value) => os.setWallpaper(value === "dither" ? "dither" : "colour")}
            >
              <Menu.RadioItem value="colour" className="d-menu-item">
                <RadioMark />
                Nebula
              </Menu.RadioItem>
              <Menu.RadioItem value="dither" className="d-menu-item">
                <RadioMark />
                Nebula, one-bit
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator className="d-menu-sep" />
            <Menu.Item asChild className="d-menu-item">
              <a href={siteConfig.links.repo} target="_blank" rel="noreferrer noopener">
                GitHub
                <ArrowUpRight aria-hidden="true" className="d-menu-meta size-3.5 p-0" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Menu.Item>
            <Menu.Item asChild className="d-menu-item">
              <a
                href={`${siteConfig.links.repo}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Licence
                <span className="d-menu-meta">MIT</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Menu.Item>
          </MenuContent>
        </Menu.Root>

        <Link href={vh("/")} className="d-mb-item font-semibold">
          {appName}
        </Link>

        <Menu.Root modal={false}>
          <Menu.Trigger className="d-mb-item">Components</Menu.Trigger>
          <MenuContent>
            {os.components.map((component) => (
              <Menu.Item key={component.slug} asChild className="d-menu-item">
                <Link href={vh(`/components/${component.slug}`)}>
                  <AppIcon id={component.slug} className="size-[18px]" />
                  {component.title}
                  <span className="d-menu-meta">{component.category}</span>
                </Link>
              </Menu.Item>
            ))}
            <Menu.Separator className="d-menu-sep" />
            {os.desktopMounted ? (
              <Menu.Item className="d-menu-item" onSelect={() => os.open("catalog")}>
                <AppIcon id="catalog" className="size-[18px]" />
                Open in Catalog
              </Menu.Item>
            ) : (
              <Menu.Item asChild className="d-menu-item">
                <Link href={vh("/components")}>
                  <AppIcon id="catalog" className="size-[18px]" />
                  Show all in Catalog
                </Link>
              </Menu.Item>
            )}
          </MenuContent>
        </Menu.Root>

        <Menu.Root modal={false}>
          <Menu.Trigger className="d-mb-item">Docs</Menu.Trigger>
          <MenuContent>
            {docs.map((section, index) => (
              <React.Fragment key={section.title}>
                {index > 0 ? <Menu.Separator className="d-menu-sep" /> : null}
                <Menu.Label className="d-menu-label">{section.title}</Menu.Label>
                {section.items.map((item) => (
                  <Menu.Item key={item.href} asChild className="d-menu-item">
                    <Link href={item.href}>{item.title}</Link>
                  </Menu.Item>
                ))}
              </React.Fragment>
            ))}
          </MenuContent>
        </Menu.Root>

        <Menu.Root modal={false}>
          <Menu.Trigger className="d-mb-item">Install</Menu.Trigger>
          <MenuContent>
            <Menu.Item className="d-menu-item" onSelect={() => launch("terminal")}>
              <AppIcon id="terminal" className="size-[18px]" />
              Open Terminal
            </Menu.Item>
            <Menu.Separator className="d-menu-sep" />
            <Menu.Item asChild className="d-menu-item">
              <Link href={vh("/docs/installation")}>Installation</Link>
            </Menu.Item>
            <Menu.Item asChild className="d-menu-item">
              <Link href={vh("/docs/registry-setup")}>
                Registry setup
                <span className="d-menu-meta font-mono">@joinui</span>
              </Link>
            </Menu.Item>
            <Menu.Item asChild className="d-menu-item">
              <Link href={vh("/docs/ai")}>Copy prompt, explained</Link>
            </Menu.Item>
          </MenuContent>
        </Menu.Root>
      </nav>

      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          className="d-mb-item"
          onClick={() => os.setSpotlightOpen(true)}
          aria-label="Spotlight search"
          aria-keyshortcuts="Meta+K Control+K"
        >
          <SearchGlyph />
        </button>
        <span className="d-mb-item pointer-events-none" aria-hidden="true">
          <WifiGlyph />
        </span>
        <span className="d-mb-item pointer-events-none max-[900px]:hidden" aria-hidden="true">
          <BatteryGlyph />
        </span>
        <span className="d-mb-item pointer-events-none max-[900px]:hidden" aria-hidden="true">
          <ControlGlyph />
        </span>
        <Clock />
      </div>
    </header>
  )
}

function MenuContent({ children }: { children: React.ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Content
        align="start"
        sideOffset={5}
        className="v-desktop dark d-menu"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </Menu.Content>
    </Menu.Portal>
  )
}

function RadioMark() {
  return (
    <span className="grid w-3.5 place-items-center">
      <Menu.ItemIndicator>
        <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      </Menu.ItemIndicator>
    </span>
  )
}

const DATE = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" })
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" })

function Clock() {
  const now = useNow()
  return (
    <span className="d-mb-item pointer-events-none tabular-nums" suppressHydrationWarning>
      {now ? (
        <>
          <span className="max-[1000px]:hidden">{DATE.format(now).replace(",", "")}</span>
          <span>{TIME.format(now)}</span>
        </>
      ) : (
        <span className="inline-block w-24" />
      )}
    </span>
  )
}

/* Status glyphs, drawn to sit on the 13px text line. */
function SearchGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" aria-hidden="true">
      <circle cx="6.8" cy="6.8" r="4.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m10.4 10.4 3.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function WifiGlyph() {
  return (
    <svg viewBox="0 0 18 14" className="h-[13px] w-[17px]" fill="currentColor" aria-hidden="true">
      <path d="M9 13.2 6.6 10.6a3.4 3.4 0 0 1 4.8 0L9 13.2Z" />
      <path d="M4.6 8.5a6.3 6.3 0 0 1 8.8 0l-1.3 1.4a4.4 4.4 0 0 0-6.2 0L4.6 8.5Z" opacity="0.95" />
      <path d="M2.4 6.2a9.5 9.5 0 0 1 13.2 0l-1.3 1.4a7.6 7.6 0 0 0-10.6 0L2.4 6.2Z" opacity="0.95" />
      <path d="M.2 3.9a12.6 12.6 0 0 1 17.6 0l-1.3 1.4a10.7 10.7 0 0 0-15 0L.2 3.9Z" opacity="0.95" />
    </svg>
  )
}

function BatteryGlyph() {
  return (
    <svg viewBox="0 0 27 13" className="h-[12px] w-[25px]" aria-hidden="true">
      <rect x="0.6" y="0.6" width="22.8" height="11.8" rx="3.4" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
      <rect x="2.2" y="2.2" width="15.4" height="8.6" rx="2" fill="currentColor" />
      <path d="M24.8 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1Z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  )
}

function ControlGlyph() {
  return (
    <svg viewBox="0 0 16 14" className="h-[13px] w-[15px]" fill="none" aria-hidden="true">
      <rect x="0.8" y="0.8" width="14.4" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12.7" cy="3.3" r="1.5" fill="currentColor" />
      <rect x="0.8" y="8.2" width="14.4" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3.3" cy="10.7" r="1.5" fill="currentColor" />
    </svg>
  )
}
