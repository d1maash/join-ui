"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, RotateCcw, X } from "lucide-react"

import { vh, type AppId, type ComponentSlug } from "./apps"
import { useOsMode, useStill, useStoredFlag } from "./hooks"
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
import { TerminalScene, terminalPlayed } from "./scenes/terminal"
import { Window } from "./window"

/*
 * The desktop — the landing page.
 *
 * Composed like a keynote desktop shot: the title owns the top-left corner
 * and nothing ever covers it, the deploy widget sits in the column under it
 * where macOS keeps widgets, the agent's run is the window on the right,
 * the Terminal sits low in the middle, and the nebula runs clear across the
 * screen between them.
 *
 * It boots as one sentence, a beat at a time: the Terminal types the
 * install, the file it wrote drops onto the desktop, the agent's run opens
 * and starts, and when it reaches the push it stops and asks — the
 * notification slides in. Answer it (Y or N work) and the run and the widget
 * move on together.
 */

const COACHED = "joinui-desktop-coached"

export function Desktop() {
  const os = useOs()
  const run = useRun()
  const mode = useOsMode()
  const still = useStill()
  const desk = React.useRef<HTMLDivElement>(null)
  /* The take whose request was dismissed, and the take whose answer has had its moment. */
  const [dismissedTake, setDismissedTake] = React.useState<number | null>(null)
  const [settledTake, setSettledTake] = React.useState<number | null>(() =>
    run.decision !== null ? run.take : null
  )
  const [installed, setInstalled] = React.useState(() => terminalPlayed())
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
  const { hold, start } = run

  React.useEffect(() => {
    setDesktopMounted(true)
    return () => setDesktopMounted(false)
  }, [setDesktopMounted])

  /*
   * The second half of the boot is cued by the Terminal finishing, not by a
   * clock, so the run cannot start before the install it depends on has
   * been seen to land.
   */
  const latest = React.useRef({ booted, still, open, start, setBooted })
  React.useEffect(() => {
    latest.current = { booted, still, open, start, setBooted }
  })
  const chain = React.useRef<number[]>([])
  const chained = React.useRef(false)

  const continueBoot = React.useCallback(() => {
    const { booted: done, still: calm } = latest.current
    if (done || chained.current) return
    chained.current = true
    chain.current.push(
      window.setTimeout(() => latest.current.open("tool-trace", "boot"), calm ? 0 : 450),
      window.setTimeout(
        () => {
          latest.current.start()
          latest.current.setBooted(true)
        },
        calm ? 50 : 950
      )
    )
  }, [])

  React.useEffect(() => () => chain.current.forEach(window.clearTimeout), [])

  const onInstalled = React.useCallback(() => {
    setInstalled(true)
    continueBoot()
  }, [continueBoot])

  /* The first half: the widget is part of the desktop, then the Terminal opens. */
  React.useEffect(() => {
    if (!live || booted) return
    hold()
    const wide = window.innerWidth >= 1280
    const timers = [
      ...(wide ? [window.setTimeout(() => open("status-timeline", "boot"), still ? 0 : 150)] : []),
      window.setTimeout(() => open("terminal", "boot"), still ? 0 : 380),
      /* If the Terminal is closed mid-install, the story still gets told. */
      window.setTimeout(continueBoot, still ? 600 : 7000),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [live, booted, hold, open, still, continueBoot])

  /* A window asked for from another page opens once the desktop is back. */
  React.useEffect(() => {
    if (!live || !pending) return
    const timer = window.setTimeout(
      () => {
        open(pending, "dock")
        setPending(null)
      },
      booted ? 120 : 1300
    )
    return () => window.clearTimeout(timer)
  }, [live, pending, booted, open, setPending])

  /* The notification: in when the agent asks, out a beat after it is answered. */
  const phase = run.phase
  const take = run.take
  const decided = run.decision !== null
  const banner = phase === "awaiting" ? dismissedTake !== take : decided && settledTake !== take
  React.useEffect(() => {
    if (!decided || settledTake === take) return
    const timer = window.setTimeout(() => setSettledTake(take), 2400)
    return () => window.clearTimeout(timer)
  }, [decided, settledTake, take])
  const showRequest = React.useCallback(() => setDismissedTake(null), [])

  const waitingUnseen = phase === "awaiting" && !banner
  React.useEffect(() => {
    setBadge("approval-gate", waitingUnseen ? 1 : 0)
  }, [waitingUnseen, setBadge])

  React.useEffect(() => {
    setDockHandler("approval-gate", () => {
      if (phase === "awaiting" && !banner) {
        showRequest()
        return true
      }
      return false
    })
    return () => setDockHandler("approval-gate", null)
  }, [phase, banner, setDockHandler, showRequest])

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
    <div ref={desk} className="d-desk">
      <Hello />

      <AnimatePresence>
        {installed ? (
          <motion.div
            key="file"
            className="d-f-file absolute"
            initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.8 }}
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
            id="status-timeline"
            kind="widget"
            title="Deploy widget"
            desk={desk}
            frame={{}}
            className="d-f-widget"
          >
            <DeployWidget compact />
            <WidgetClose id="status-timeline" />
          </Window>

          <Window
            id="tool-trace"
            title="Tool Trace"
            subtitle="agent · feat/approval-gate"
            desk={desk}
            frame={{}}
            className="d-f-trace"
            toolbar={<PageLink slug="tool-trace" />}
            bodyClassName="d-f-trace-body overflow-y-auto"
          >
            <AgentRunScene
              size="sm"
              requestHidden={!banner}
              onShowRequest={showRequest}
            />
          </Window>

          <Window
            id="terminal"
            title="Terminal"
            subtitle="acme-app — zsh"
            desk={desk}
            frame={{}}
            className="d-f-terminal"
            bodyClassName="d-f-terminal-body flex-none !bg-transparent"
          >
            <TerminalScene onInstalled={onInstalled} onOpen={openApp} />
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
            frame={{ left: "max(16px, calc(50% - 380px))", top: "clamp(30px, 7vh, 90px)", width: "min(760px, calc(100% - 32px))" }}
            bodyClassName="flex-none h-[min(440px,calc(100dvh-var(--d-menubar)-var(--d-dock-space)-110px))]"
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
            {banner && booted ? (
              <motion.div
                key={`banner-${take}`}
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
                    onClose={() => setDismissedTake(take)}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <CoachMark ready={booted && phase !== "idle"} />
        </>
      ) : null}
    </div>
  )
}

/* Positions for the apps that start closed: cascaded, so two never stack exactly. */
const CASCADE: Partial<Record<AppId, { left: string; top: string }>> = {
  "approval-gate": { left: "max(16px, calc(50% - 300px))", top: "clamp(40px, 8vh, 100px)" },
  "agent-hive": { left: "max(16px, calc(50% - 220px))", top: "clamp(30px, 5vh, 70px)" },
  "focus-stack": { left: "max(16px, calc(50% - 170px))", top: "clamp(50px, 10vh, 120px)" },
  "glass-crest": { left: "max(16px, calc(50% - 330px))", top: "clamp(40px, 7vh, 90px)" },
  "carbon-copy": { left: "max(16px, calc(50% - 250px))", top: "clamp(60px, 14vh, 160px)" },
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
      frame={{ ...at, width: `min(${width}px, calc(100% - 32px))` }}
      toolbar={toolbar}
      footer={<AppFooter slug={id} />}
      bodyClassName="max-h-[calc(100dvh-var(--d-menubar)-var(--d-dock-space)-120px)] overflow-y-auto"
    >
      {children}
    </Window>
  )
}

function PageLink({ slug }: { slug: ComponentSlug }) {
  return (
    <Link href={vh(`/components/${slug}`)} className="d-link text-[12px] font-medium">
      Open page
      <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={2.4} />
    </Link>
  )
}

function AppFooter({ slug }: { slug: ComponentSlug }) {
  return (
    <>
      <span className="truncate font-mono text-[11px]">components/joinui/{slug}.tsx</span>
      <span className="ml-auto shrink-0">
        <PageLink slug={slug} />
      </span>
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

/*
 * A coach mark for the first visit only: one line over the Dock, gone for
 * good the first time anything is opened from it, or when dismissed.
 */
function CoachMark({ ready }: { ready: boolean }) {
  const os = useOs()
  const still = useStill()
  const [coached, setCoached] = useStoredFlag(COACHED)
  const [due, setDue] = React.useState(false)
  const launched = Object.keys(os.launches).length > 0

  React.useEffect(() => {
    if (!ready || coached) return
    const timer = window.setTimeout(() => setDue(true), 1600)
    return () => window.clearTimeout(timer)
  }, [ready, coached])

  React.useEffect(() => {
    if (launched && !coached) setCoached()
  }, [launched, coached, setCoached])

  return (
    <AnimatePresence>
      {due && !coached ? (
        <motion.div
          className="d-coach"
          role="note"
          initial={still ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <span>Every icon is an app. Click one to open it.</span>
          <span className="d-coach-sep" aria-hidden="true" />
          <span className="d-key">⌘</span>
          <span className="d-key">K</span>
          <span>searches</span>
          <button type="button" className="d-coach-close" aria-label="Dismiss tip" onClick={setCoached}>
            <X aria-hidden="true" className="size-3" strokeWidth={2.6} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
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

function FileIcon() {
  return (
    <svg viewBox="0 0 64 80" className="h-[60px] w-12 drop-shadow-[0_4px_8px_rgb(0_0_0/0.45)]" aria-hidden="true">
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
