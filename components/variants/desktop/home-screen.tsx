"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, ChevronLeft } from "lucide-react"

import { CopyButton } from "@/components/site/copy-button"
import { siteConfig } from "@/lib/site"

import { AppIcon } from "./app-icon"
import { COMPONENT_SLUGS, SHORT_NAME, isComponentSlug, tagColour, vh, type AppId } from "./apps"
import { useOsMode, useStill } from "./hooks"
import { useOs } from "./os"
import { useRun } from "./run"
import {
  AboutApp,
  AgentHiveApp,
  ApprovalGateApp,
  CarbonCopyApp,
  FocusStackApp,
  GlassCrestApp,
} from "./scenes/app-scenes"
import { AgentRunScene, ApprovalNotice, DeployWidget } from "./scenes/run-scenes"
import { TerminalScene } from "./scenes/terminal"

/*
 * The phone: the same OS, as a home screen.
 *
 * A lock-screen title, the agent's request waiting as a notification, the
 * deploy as a widget, a grid of app icons and a Dock. Tapping an icon opens
 * the app full screen, grown out of the icon the way iOS launches one.
 * The page scrolls like a page — nothing here holds the finger.
 */

const GRID: AppId[] = [...COMPONENT_SLUGS, "about"]
const DOCK: AppId[] = ["catalog", "terminal", "docs", "github"]

export function HomeScreen() {
  const run = useRun()
  const os = useOs()
  const mode = useOsMode()
  const [app, setApp] = React.useState<{ id: AppId; from: DOMRect } | null>(null)
  const opener = React.useRef<HTMLElement | null>(null)

  const launch = (id: AppId, event: React.MouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget
    setApp({ id, from: event.currentTarget.getBoundingClientRect() })
  }

  const asking =
    run.phase === "awaiting" ||
    run.phase === "pushing" ||
    run.phase === "opening" ||
    run.phase === "done" ||
    run.phase === "denied" ||
    run.phase === "expired"

  return (
    <div className="d-phone-only relative mx-auto max-w-[480px] px-5 pb-28">
      <header className="pt-5 pb-6 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-white/85">
          Seven components · MIT · source you own
        </p>
        <h1 className="mt-0.5 text-[84px] leading-[0.95] font-light tracking-[-0.03em] text-white/95 [text-shadow:0_2px_30px_rgb(0_0_0/0.35)]">
          Join UI
        </h1>
      </header>

      {asking ? (
        <section aria-label="Notification" className="d-glass relative mb-4 rounded-[24px]">
          <div className="d-win-clip">
            <ApprovalNotice hotkeys="focus" className="bg-[rgb(22_22_25/0.5)]" />
          </div>
        </section>
      ) : null}

      <section aria-label="Deploy widget" className="d-glass mb-7 rounded-[26px]">
        <div className="d-win-clip bg-[rgb(22_22_25/0.42)]">
          <DeployWidget />
        </div>
      </section>

      <nav aria-label="Apps">
        <ul className="grid grid-cols-4 gap-x-3 gap-y-5">
          {GRID.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={(event) => launch(id, event)}
                className="flex w-full flex-col items-center gap-1.5 rounded-2xl outline-offset-4 active:scale-95"
                style={{ transition: "transform 160ms" }}
              >
                <AppIcon id={id} className="size-[62px] drop-shadow-[0_6px_12px_rgb(0_0_0/0.35)]" />
                <span className="text-[12px] font-medium text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.6)]">
                  {id === "about" ? "Join UI" : SHORT_NAME[id]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => os.setSpotlightOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full bg-white/14 px-3.5 text-[13px] font-medium text-white backdrop-blur-xl"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
            <circle cx="6.8" cy="6.8" r="4.6" stroke="currentColor" strokeWidth="1.8" />
            <path d="m10.4 10.4 3.6 3.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          Search
        </button>
      </div>

      <nav aria-label="Dock" className="mt-5">
        <ul className="flex justify-between rounded-[32px] bg-white/12 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14),inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-2xl">
          {DOCK.map((id) => (
            <li key={id}>
              {id === "docs" ? (
                <Link href={vh("/docs")} aria-label="Docs" className="block rounded-2xl">
                  <AppIcon id={id} className="size-[60px]" />
                </Link>
              ) : id === "github" ? (
                <a href={siteConfig.links.repo} target="_blank" rel="noreferrer noopener" aria-label="GitHub (opens in a new tab)" className="block rounded-2xl">
                  <AppIcon id={id} className="size-[60px]" />
                </a>
              ) : (
                <button type="button" aria-label={SHORT_NAME[id]} onClick={(event) => launch(id, event)} className="block rounded-2xl active:scale-95">
                  <AppIcon id={id} className="size-[60px]" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <AnimatePresence onExitComplete={() => opener.current?.focus({ preventScroll: true })}>
        {app && mode === "mobile" ? (
          <AppSheet key={app.id} id={app.id} from={app.from} onClose={() => setApp(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function AppSheet({ id, from, onClose }: { id: AppId; from: DOMRect; onClose: () => void }) {
  const os = useOs()
  const still = useStill()
  const titleId = React.useId()
  const close = React.useRef<HTMLButtonElement>(null)
  const info = isComponentSlug(id) ? os.component(id) : undefined
  const title = info?.title ?? (id === "about" ? "Join UI" : id === "catalog" ? "Catalog" : "Terminal")
  const [take, setTake] = React.useState(0)

  React.useEffect(() => {
    const root = document.documentElement
    const before = root.style.overflow
    root.style.overflow = "hidden"
    close.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      root.style.overflow = before
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  /* Grown out of the icon: start at its box, end at the screen. */
  const vw = typeof window === "undefined" ? 390 : window.innerWidth
  const vhPx = typeof window === "undefined" ? 844 : window.innerHeight
  const origin = {
    scale: from.width / vw,
    x: from.left + from.width / 2 - vw / 2,
    y: from.top + from.height / 2 - vhPx / 2,
  }
  const hidden = still ? { opacity: 0 } : { opacity: 0, scale: origin.scale, x: origin.x, y: origin.y, borderRadius: 60 }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[160] flex flex-col overflow-hidden bg-[#0d0d10]"
      initial={hidden}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 0 }}
      exit={hidden}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-white/8 bg-[#16161a]/90 px-2 backdrop-blur-xl">
        <button
          ref={close}
          type="button"
          onClick={onClose}
          className="flex h-10 items-center gap-0.5 rounded-lg pr-2 text-[17px] text-[#4aa3ff]"
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2.4} />
          Home
        </button>
        <h2 id={titleId} className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {info ? (
          <Link href={vh(`/components/${id}`)} className="ml-auto flex h-10 items-center gap-1 rounded-lg px-2 text-[17px] text-[#4aa3ff]">
            Page
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24">
        <SheetBody id={id} take={take} onReplay={() => setTake((n) => n + 1)} />
        {info ? (
          <div className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl bg-white/6 p-4">
            <p className="text-[15px] leading-[1.45] text-white/80">{info.description}</p>
            <div className="flex items-center gap-2 rounded-xl bg-black/40 py-1.5 pr-1.5 pl-3">
              <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-white/80">{info.installCommand}</code>
              <CopyButton value={info.installCommand} label="Copy install command" toastMessage="Install command copied" />
            </div>
            <Link href={vh(`/components/${id}`)} className="d-btn h-10 text-[15px]" data-tone="blue">
              Source, props and prompt
            </Link>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

function SheetBody({ id, take, onReplay }: { id: AppId; take: number; onReplay: () => void }) {
  const os = useOs()
  switch (id) {
    case "approval-gate":
      return <ApprovalGateApp />
    case "tool-trace":
      return <AgentRunScene size="sm" />
    case "agent-hive":
      return <AgentHiveApp size="sm" />
    case "status-timeline":
      return <DeployWidget className="pt-6" />
    case "focus-stack":
      return <FocusStackApp />
    case "glass-crest":
      return <GlassCrestApp />
    case "carbon-copy":
      return (
        <div>
          <CarbonCopyApp take={take} />
          <div className="px-8">
            <button type="button" className="d-btn" onClick={onReplay}>
              Replay
            </button>
          </div>
        </div>
      )
    case "terminal":
      return (
        <div className="flex h-[60vh] flex-col">
          <TerminalScene onOpen={() => undefined} />
        </div>
      )
    case "about":
      return <AboutApp />
    case "catalog":
      return (
        <ul className="m-4 overflow-hidden rounded-2xl bg-white/6">
          {os.components.map((component) => (
            <li key={component.slug} className="border-b border-white/8 last:border-b-0">
              <Link href={vh(`/components/${component.slug}`)} className="flex items-center gap-3 px-3 py-2.5">
                <AppIcon id={component.slug} className="size-10" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium">{component.title}</span>
                  <span className="flex items-center gap-1.5 text-[13px] text-white/55">
                    <span className="size-2 rounded-full" style={{ background: tagColour(component.category) }} />
                    {component.category}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}
