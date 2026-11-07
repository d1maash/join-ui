"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"

import { vh, type AppId, type ComponentSlug } from "./apps"
import { useOsMode, useStill } from "./hooks"
import { useOs } from "./os"
import { useRun } from "./run"
import {
  AboutApp,
  AgentHiveApp,
  ApprovalGateApp,
  CarbonCopyApp,
  CatalogApp,
  FocusStackApp,
  GlassCrestApp,
} from "./scenes/app-scenes"
import { AgentRunScene, ApprovalNotice, DeployWidget } from "./scenes/run-scenes"
import { TerminalScene } from "./scenes/terminal"
import { Window } from "./window"

/*
 * The desktop — the landing page.
 *
 * On first load it boots: the wallpaper, menu bar and Dock are already in
 * the HTML, then the windows open one after another the way a session
 * restores — Terminal, the agent's run, the deploy widget — and the
 * Terminal installs Approval Gate. A moment later the agent asks to push,
 * and the request arrives as a notification. Answer it (Y or N work) and
 * the run and the widget move on together.
 */

/* The Terminal opens last, so it is the key window — the story starts there. */
const BOOT: Array<{ id: AppId; at: number }> = [
  { id: "status-timeline", at: 200 },
  { id: "tool-trace", at: 420 },
  { id: "terminal", at: 700 },
]

export function Desktop() {
  const os = useOs()
  const run = useRun()
  const mode = useOsMode()
  const still = useStill()
  const desk = React.useRef<HTMLDivElement>(null)
  const [banner, setBanner] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const [installed, setInstalled] = React.useState(false)
  const [carbonTake, setCarbonTake] = React.useState(0)
  const live = mode === "desktop"

  const {
    setDesktopMounted,
    booted,
    setBooted,
    open,
    pending,
    setPending,
    setBadge,
    setDockHandler,
  } = os

  React.useEffect(() => {
    setDesktopMounted(true)
    return () => setDesktopMounted(false)
  }, [setDesktopMounted])

  /* Boot, once per visit. */
  const { hold, start } = run
  React.useEffect(() => {
    if (!live || booted) return
    hold()
    const wide = window.innerWidth >= 1180
    const timers = BOOT.filter((entry) => wide || entry.id !== "status-timeline").map((entry) =>
      window.setTimeout(() => open(entry.id, "boot"), still ? 0 : entry.at)
    )
    /* Marked booted only at the end, so the re-render it causes cannot cancel the sequence. */
    timers.push(
      window.setTimeout(
        () => {
          start()
          setBooted(true)
        },
        still ? 400 : 1500
      )
    )
    return () => timers.forEach(window.clearTimeout)
  }, [live, booted, setBooted, hold, start, open, still])

  /* A window asked for from another page opens once the desktop is back. */
  React.useEffect(() => {
    if (!live || !pending) return
    const timer = window.setTimeout(() => {
      open(pending, "dock")
      setPending(null)
    }, booted ? 120 : 1300)
    return () => window.clearTimeout(timer)
  }, [live, pending, booted, open, setPending])

  /* The notification: in when the agent asks, out a beat after it is answered. */
  const phase = run.phase
  React.useEffect(() => {
    if (phase === "awaiting") {
      if (!dismissed) setBanner(true)
      return
    }
    setDismissed(false)
    if (phase === "pushing" || phase === "denied" || phase === "expired") {
      const timer = window.setTimeout(() => setBanner(false), 2400)
      return () => window.clearTimeout(timer)
    }
    setBanner(false)
  }, [phase, dismissed])

  const waitingUnseen = phase === "awaiting" && !banner
  React.useEffect(() => {
    setBadge("approval-gate", waitingUnseen ? 1 : 0)
  }, [waitingUnseen, setBadge])

  React.useEffect(() => {
    setDockHandler("approval-gate", () => {
      if (phase === "awaiting" && !banner) {
        setDismissed(false)
        setBanner(true)
        return true
      }
      return false
    })
    return () => setDockHandler("approval-gate", null)
  }, [phase, banner, setDockHandler])

  /* Escape closes the window in front, unless something else wants the key. */
  const { focused, close, dockIcon } = os
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || !focused) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [role='menu'], [role='dialog'], [cmdk-root]")) return
      close(focused)
      const icon = dockIcon(focused)?.querySelector<HTMLElement>("button, a")
      if (target && target !== document.body) icon?.focus({ preventScroll: true })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focused, close, dockIcon])

  const openApp = React.useCallback((slug: ComponentSlug) => open(slug, "other"), [open])

  return (
    <div ref={desk} className="d-desk" style={{ ["--d-dock-space" as string]: "150px" }}>
      <Hello />
      <Tip />

      <AnimatePresence>
        {installed ? (
          <motion.div
            key="file"
            className="absolute"
            style={{ left: "clamp(28px, 4vw, 72px)", top: "clamp(250px, 33vh, 330px)" }}
            initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
          >
            <Link href={`${vh("/components/approval-gate")}#code`} className="d-file">
              <FileIcon />
              <span className="d-file-name">approval-gate.tsx</span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {live ? (
        <>
          <Window
            id="terminal"
            title="Terminal"
            subtitle="acme-app — zsh"
            desk={desk}
            frame={{
              left: "clamp(24px, 3.4vw, 64px)",
              bottom: "calc(var(--d-dock-space) + 40px)",
              width: "clamp(460px, 38vw, 580px)",
            }}
            bodyClassName="h-[clamp(190px,27vh,280px)] !bg-transparent"
          >
            <TerminalScene onInstalled={() => setInstalled(true)} onOpen={openApp} />
          </Window>

          <Window
            id="tool-trace"
            title="Tool Trace"
            subtitle="agent · feat/approval-gate"
            desk={desk}
            frame={{
              left: "clamp(470px, 37vw, 780px)",
              top: "clamp(36px, 8vh, 110px)",
              width: "clamp(440px, 34vw, 540px)",
            }}
            footer={<AppFooter slug="tool-trace" />}
            bodyClassName="max-h-[calc(100dvh-var(--d-menubar)-var(--d-dock-space)-130px)] overflow-y-auto"
          >
            <AgentRunScene
              requestHidden={!banner}
              onShowRequest={() => {
                setDismissed(false)
                setBanner(true)
              }}
            />
          </Window>

          <Window
            id="status-timeline"
            kind="widget"
            title="Deploy widget"
            desk={desk}
            frame={{ right: "clamp(20px, 2.4vw, 44px)", top: "clamp(270px, 33vh, 320px)", width: 300 }}
          >
            <DeployWidget />
            <WidgetClose id="status-timeline" />
          </Window>

          <AppWindow id="approval-gate" desk={desk} width={480}>
            <ApprovalGateApp />
          </AppWindow>
          <AppWindow id="agent-hive" desk={desk} width={500}>
            <AgentHiveApp />
          </AppWindow>
          <AppWindow id="focus-stack" desk={desk} width={460}>
            <FocusStackApp />
          </AppWindow>
          <AppWindow id="glass-crest" desk={desk} width={540}>
            <GlassCrestApp />
          </AppWindow>
          <AppWindow
            id="carbon-copy"
            desk={desk}
            width={580}
            toolbar={
              <button type="button" className="d-btn h-7 px-2.5" onClick={() => setCarbonTake((n) => n + 1)}>
                <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
                Replay
              </button>
            }
          >
            <CarbonCopyApp take={carbonTake} />
          </AppWindow>

          <Window
            id="catalog"
            title="Catalog"
            subtitle={`${os.components.length} components`}
            desk={desk}
            frame={{ left: "calc(50% - 380px)", top: "clamp(30px, 7vh, 90px)", width: 760 }}
            bodyClassName="h-[440px]"
            toolbar={
              <Link href={vh("/components")} className="d-btn h-7 px-2.5">
                Open full catalog
              </Link>
            }
          >
            <CatalogApp components={os.components} />
          </Window>

          <Window
            id="about"
            title="About Join UI"
            desk={desk}
            frame={{ left: "calc(50% - 200px)", top: "clamp(30px, 9vh, 120px)", width: 400 }}
          >
            <AboutApp />
          </Window>

          <AnimatePresence>
            {banner ? (
              <motion.div
                key={`banner-${run.take}`}
                className="d-banner d-glass"
                role="region"
                aria-label="Notification"
                initial={still ? { opacity: 0 } : { opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={still ? { opacity: 0 } : { opacity: 0, x: 80, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <div className="d-win-clip">
                  <ApprovalNotice
                    hotkeys="global"
                    className="bg-[rgb(22_22_25/0.55)]"
                    onClose={() => {
                      setDismissed(true)
                      setBanner(false)
                    }}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  )
}

/* Positions for the apps that start closed: cascaded, so two never stack exactly. */
const CASCADE: Partial<Record<AppId, { left: string; top: string }>> = {
  "approval-gate": { left: "calc(50% - 300px)", top: "clamp(40px, 8vh, 100px)" },
  "agent-hive": { left: "calc(50% - 220px)", top: "clamp(30px, 5vh, 70px)" },
  "focus-stack": { left: "calc(50% - 170px)", top: "clamp(50px, 10vh, 120px)" },
  "glass-crest": { left: "calc(50% - 330px)", top: "clamp(40px, 7vh, 90px)" },
  "carbon-copy": { left: "calc(50% - 250px)", top: "clamp(60px, 14vh, 160px)" },
}

function AppWindow({
  id,
  desk,
  width,
  toolbar,
  children,
}: {
  id: ComponentSlug
  desk: React.RefObject<HTMLDivElement | null>
  width: number
  toolbar?: React.ReactNode
  children: React.ReactNode
}) {
  const os = useOs()
  const info = os.component(id)
  const at = CASCADE[id] ?? { left: "30%", top: "10%" }
  return (
    <Window
      id={id}
      title={info?.title ?? id}
      subtitle={info?.category}
      desk={desk}
      frame={{ ...at, width }}
      toolbar={toolbar}
      footer={<AppFooter slug={id} />}
      bodyClassName="max-h-[calc(100dvh-var(--d-menubar)-var(--d-dock-space)-120px)] overflow-y-auto"
    >
      {children}
    </Window>
  )
}

function AppFooter({ slug }: { slug: ComponentSlug }) {
  return (
    <>
      <span className="truncate font-mono text-[11px]">components/joinui/{slug}.tsx</span>
      <Link href={vh(`/components/${slug}`)} className="d-link ml-auto shrink-0 text-[12px] font-medium">
        Open page
        <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={2.4} />
      </Link>
    </>
  )
}

function WidgetClose({ id }: { id: AppId }) {
  const os = useOs()
  return (
    <button
      type="button"
      className="d-widget-close"
      aria-label="Remove widget"
      onClick={(event) => {
        event.stopPropagation()
        os.close(id)
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
        <path d="M2.2 5h5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function Hello() {
  return (
    <div className="d-hello">
      <p className="d-hello-date">Seven components · MIT · source you own</p>
      <h1 className="d-hello-title">Join UI</h1>
    </div>
  )
}

function Tip() {
  return (
    <p className="d-hello-tip">
      Open a component from the Dock · drag a window by its title bar ·
      <span className="d-key">⌘</span>
      <span className="d-key">K</span>
      to search
    </p>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 64 80" className={cn("h-[60px] w-12 drop-shadow-[0_4px_8px_rgb(0_0_0/0.45)]")} aria-hidden="true">
      <path d="M6 2h36l16 16v54a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" fill="#f5f5f7" />
      <path d="M42 2v12a4 4 0 0 0 4 4h12" fill="#d8d8de" />
      <path d="M42 2l16 16" stroke="#c7c7cc" strokeWidth="0.8" />
      <rect x="9" y="50" width="40" height="15" rx="4" fill="#0a84ff" />
      <text x="29" y="61.4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="-apple-system, var(--font-inter), system-ui, sans-serif" letterSpacing="0.5">
        TSX
      </text>
      <path d="M10 22h22M10 29h30M10 36h18" stroke="#c7c7cc" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
