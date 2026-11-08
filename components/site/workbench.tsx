"use client"

import * as React from "react"
import Link from "next/link"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import {
  Maximize2,
  Monitor,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
  Tablet,
} from "lucide-react"

import { renderPreview } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

/*
 * The workbench.
 * ---------------------------------------------------------------------------
 * A canvas on the left, a panel on the right, a draggable seam between them.
 * The canvas runs the real preview on a dotted stage and can be replayed
 * (remounted, so entrance animations play again), flipped to the light theme
 * (a `.light` island — the component re-themes through its tokens, which is
 * the same mechanism a consumer's light page uses) and narrowed to a tablet
 * or phone width. The panel holds install, code, prompt and props; its
 * contents are rendered on the server and handed in.
 *
 * Below 1280px the split stacks: canvas first, then the tabs at full width.
 */

type Theme = "dark" | "light"
type Viewport = "desktop" | "tablet" | "mobile"

const VIEWPORTS: Array<{
  value: Viewport
  label: string
  width: number | null
  icon: typeof Monitor
}> = [
  { value: "desktop", label: "Full width", width: null, icon: Monitor },
  { value: "tablet", label: "Tablet, 768px", width: 768, icon: Tablet },
  { value: "mobile", label: "Phone, 390px", width: 390, icon: Smartphone },
]

/*
 * Tablet and phone widths are rendered through the standalone preview route
 * in a same-origin frame, so the component sees a real viewport of that size
 * and its media queries answer to it. The frame is stripped of that page's
 * own chrome and handed the theme, and the gallery's dark surface tokens.
 */
const EMBED_CSS = `
body > div > header { display: none !important; }
main { padding: 0 !important; }
main > div { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; min-height: 100dvh !important; }
main > div > div:first-child { display: none !important; }
html.dark { --background: #09090b; --card: #111114; --popover: #121215; --muted: #1c1c21; --border: #1e1e23; --border-hover: #2a2a31; }
nextjs-portal { display: none !important; }
`

const PANEL_MIN = 340
const PANEL_MAX = 720

export interface WorkbenchTab {
  value: string
  label: string
  count?: number
  content: React.ReactNode
}

export function Workbench({
  slug,
  title,
  tabs,
}: {
  slug: string
  title: string
  tabs: WorkbenchTab[]
}) {
  const [theme, setTheme] = React.useState<Theme>("dark")
  const [viewport, setViewport] = React.useState<Viewport>("desktop")
  const [run, setRun] = React.useState(0)
  const [panel, setPanel] = React.useState(432)
  const [dragging, setDragging] = React.useState(false)
  const root = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLIFrameElement>(null)

  const frameWidth = VIEWPORTS.find((entry) => entry.value === viewport)?.width ?? null
  const demo = renderPreview(slug)

  const dressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const dressFrame = React.useCallback(() => {
    const doc = frame.current?.contentDocument
    if (!doc?.documentElement || !doc.head) return
    if (!doc.getElementById("g-embed")) {
      const style = doc.createElement("style")
      style.id = "g-embed"
      style.textContent = EMBED_CSS
      doc.head.appendChild(style)
    }
    /*
     * The theme is a class on the frame's <html>, which React hydrates;
     * changing it before hydration has reached that node would be reported
     * as a mismatch, so wait for React to have claimed it.
     */
    const html = doc.documentElement
    let tries = 0
    const apply = () => {
      const claimed = Object.keys(html).some((key) => key.startsWith("__reactFiber"))
      if (!claimed && tries++ < 120) {
        dressTimer.current = setTimeout(apply, 50)
        return
      }
      html.classList.toggle("dark", theme === "dark")
      html.classList.toggle("light", theme === "light")
      html.style.colorScheme = theme
    }
    if (dressTimer.current) clearTimeout(dressTimer.current)
    apply()
  }, [theme])

  React.useEffect(
    () => () => {
      if (dressTimer.current) clearTimeout(dressTimer.current)
    },
    []
  )

  React.useEffect(() => {
    dressFrame()
  }, [dressFrame])

  const clamp = React.useCallback((value: number) => {
    const total = root.current?.clientWidth ?? 1400
    const max = Math.max(PANEL_MIN, Math.min(PANEL_MAX, total - 420))
    return Math.round(Math.min(max, Math.max(PANEL_MIN, value)))
  }, [])

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !root.current) return
    const right = root.current.getBoundingClientRect().right
    setPanel(clamp(right - event.clientX))
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }

  function onSeamKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 64 : 16
    if (event.key === "ArrowLeft") setPanel((value) => clamp(value + step))
    else if (event.key === "ArrowRight") setPanel((value) => clamp(value - step))
    else if (event.key === "Home") setPanel(clamp(PANEL_MAX))
    else if (event.key === "End") setPanel(clamp(PANEL_MIN))
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={root}
      className={cn(
        "flex flex-col border-y border-[var(--g-line)] xl:flex-row",
        "xl:h-[clamp(34rem,calc(100dvh-var(--g-top)-7.75rem),60rem)]",
        dragging && "cursor-col-resize select-none"
      )}
      style={{ "--wb-panel": `${panel}px` } as React.CSSProperties}
    >
      <section
        aria-label={`${title} preview`}
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--g-line)] px-2 sm:px-3">
          <span className="flex items-center gap-2 px-1.5 text-[0.8125rem] font-medium text-[var(--g-ink-2)]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[var(--g-accent)] shadow-[0_0_0_3px_var(--g-accent-soft)]"
            />
            Live preview
          </span>
          {frameWidth ? (
            <span className="g-num hidden text-[0.75rem] text-[var(--g-ink-4)] sm:inline">
              {frameWidth}px
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRun((value) => value + 1)}
              className="g-icon-btn cursor-pointer"
              aria-label="Replay the preview"
              title="Replay"
            >
              <RotateCcw aria-hidden="true" />
            </button>

            <Segmented label="Preview theme">
              <SegmentButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                label="Dark theme"
              >
                <Moon aria-hidden="true" />
              </SegmentButton>
              <SegmentButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
                label="Light theme"
              >
                <Sun aria-hidden="true" />
              </SegmentButton>
            </Segmented>

            <Segmented label="Preview width" className="hidden md:flex">
              {VIEWPORTS.map((entry) => (
                <SegmentButton
                  key={entry.value}
                  active={viewport === entry.value}
                  onClick={() => setViewport(entry.value)}
                  label={entry.label}
                >
                  <entry.icon aria-hidden="true" />
                </SegmentButton>
              ))}
            </Segmented>

            <Link
              href={`/preview/${slug}`}
              className="g-icon-btn"
              aria-label={`Open ${title} full-screen`}
              title="Full screen"
            >
              <Maximize2 aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "g-stage relative h-[26rem] overflow-auto sm:h-[32rem] xl:h-auto xl:min-h-0 xl:flex-1",
            theme === "light" && "light"
          )}
        >
          <div
            className={cn(
              "g-frame mx-auto flex max-w-full flex-col",
              frameWidth ? "h-full" : "min-h-full",
              frameWidth &&
                "my-0 border-x border-dashed border-[color-mix(in_oklab,var(--foreground)_16%,transparent)] bg-background"
            )}
            style={{ width: frameWidth ? `${frameWidth}px` : "100%" }}
          >
            {frameWidth ? (
              <iframe
                key={run}
                ref={frame}
                src={`/preview/${slug}`}
                title={`${title} at ${frameWidth}px`}
                onLoad={dressFrame}
                className="block w-full flex-1 bg-background"
              />
            ) : (
              <div
                key={run}
                className="flex min-h-full flex-1 items-center justify-center p-6 text-foreground sm:p-10"
              >
                {demo ?? (
                  <p className="text-sm text-muted-foreground">
                    No preview is registered for <code>{slug}</code>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize the panel"
        aria-valuemin={PANEL_MIN}
        aria-valuemax={PANEL_MAX}
        aria-valuenow={panel}
        tabIndex={0}
        data-dragging={dragging}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onSeamKey}
        className="g-resizer relative z-10 -mx-1.5 hidden w-3 shrink-0 cursor-col-resize outline-none xl:block"
      />

      <aside
        aria-label={`${title} install, code, prompt and props`}
        className="flex min-h-0 flex-col border-t border-[var(--g-line)] bg-[var(--g-bg-2)] xl:w-[var(--wb-panel)] xl:shrink-0 xl:border-t-0"
      >
        <TabsPrimitive.Root
          defaultValue={tabs[0]?.value}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsPrimitive.List
            aria-label={`${title} details`}
            className="g-scroller flex h-11 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--g-line)] px-2"
          >
            {tabs.map((tab) => (
              <TabsPrimitive.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "group relative flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors",
                  "text-[var(--g-ink-3)] hover:text-[var(--g-ink)]",
                  "data-[state=active]:bg-[var(--g-panel-3)] data-[state=active]:text-[var(--g-ink)]"
                )}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span className="g-num text-[0.6875rem] text-[var(--g-ink-4)] group-data-[state=active]:text-[var(--g-ink-3)]">
                    {tab.count}
                  </span>
                ) : null}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          {tabs.map((tab) => (
            <TabsPrimitive.Content
              key={tab.value}
              value={tab.value}
              className="g-thin-scroll min-h-0 flex-1 outline-none xl:overflow-y-auto"
            >
              {tab.content}
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </aside>
    </div>
  )
}

function Segmented({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex h-8 items-center rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] p-0.5",
        className
      )}
    >
      {children}
    </div>
  )
}

function SegmentButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-full w-7 cursor-pointer items-center justify-center rounded-md transition-colors [&_svg]:size-3.5",
        active
          ? "bg-[var(--g-panel-3)] text-[var(--g-ink)] shadow-[inset_0_0_0_1px_var(--g-line-2)]"
          : "text-[var(--g-ink-3)] hover:text-[var(--g-ink)]"
      )}
    >
      {children}
    </button>
  )
}
