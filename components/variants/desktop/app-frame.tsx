"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ChevronLeft } from "lucide-react"

import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { renderPreview } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

import { AppIcon } from "./app-icon"
import { tagColour, vh, type ComponentSlug } from "./apps"
import { useStill } from "./hooks"

export const VIEWS = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
  { id: "install", label: "Install" },
  { id: "props", label: "Props" },
  { id: "prompt", label: "Prompt" },
] as const

export type ViewId = (typeof VIEWS)[number]["id"]

/*
 * A component's app, maximised.
 *
 * The window sits on the wallpaper with a margin of it showing all round,
 * the menu bar above. A unified toolbar — traffic lights, the app's name,
 * a segmented control for its five views and the Copy prompt button — then
 * three panes: a Finder-style source list, the content, and an inspector
 * with the facts. Long text lives on near-opaque fills; the glass is for the
 * frame. Close and minimise go back to the desktop; zoom takes the margins
 * away.
 *
 * The view is mirrored into the URL hash, so `…/approval-gate#code` opens on
 * the source — which is where the file icon on the desktop points.
 */
export function AppFrame({
  slug,
  title,
  category,
  prompt,
  sidebar,
  views,
  below,
  inspector,
}: {
  slug: ComponentSlug
  title: string
  category: string
  prompt: string
  sidebar: React.ReactNode
  views: Record<ViewId, React.ReactNode>
  below: React.ReactNode
  inspector: React.ReactNode
}) {
  const [view, setView] = React.useState<ViewId>("preview")
  const [full, setFull] = React.useState(false)
  const still = useStill()
  const scroller = React.useRef<HTMLElement>(null)
  const tabs = React.useRef<Array<HTMLButtonElement | null>>([])
  const baseId = React.useId()

  React.useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1)
      const match = VIEWS.find((entry) => entry.id === hash)
      if (match) setView(match.id)
    }
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  const choose = (next: ViewId, focus = false) => {
    setView(next)
    const url = next === "preview" ? window.location.pathname : `#${next}`
    window.history.replaceState(null, "", url)
    scroller.current?.scrollTo({ top: 0 })
    if (focus) tabs.current[VIEWS.findIndex((entry) => entry.id === next)]?.focus()
  }

  const onKey = (event: React.KeyboardEvent) => {
    const index = VIEWS.findIndex((entry) => entry.id === view)
    let next = -1
    if (event.key === "ArrowRight") next = (index + 1) % VIEWS.length
    else if (event.key === "ArrowLeft") next = (index - 1 + VIEWS.length) % VIEWS.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = VIEWS.length - 1
    if (next === -1) return
    event.preventDefault()
    const entry = VIEWS[next]
    if (entry) choose(entry.id, true)
  }

  return (
    <div className={cn("d-stage", full && "d-stage-full")}>
      <div className="d-appwin d-glass" role="region" aria-label={`${title} window`}>
        <div className="d-win-clip">
          <div className="d-toolbar">
            <div className="d-lights max-md:hidden">
              <Link href={vh("/")} className="d-light" data-c="close" aria-label={`Close ${title} and return to the desktop`}>
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2.6 2.6l4.8 4.8M7.4 2.6 2.6 7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Link>
              <Link href={vh("/")} className="d-light" data-c="min" aria-label={`Minimise ${title} to the desktop`}>
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2.2 5h5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Link>
              <button
                type="button"
                className="d-light"
                data-c="zoom"
                aria-pressed={full}
                aria-label={full ? `Restore the ${title} window` : `Zoom the ${title} window`}
                onClick={() => setFull((value) => !value)}
              >
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2.6 6.9V2.6h4.3zM7.4 3.1v4.3H3.1z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <Link href={vh("/")} className="d-back md:hidden">
              <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2.3} />
              Home
            </Link>

            <div className="flex min-w-0 items-center gap-2.5 md:pl-2">
              <AppIcon id={slug} className="size-7 shrink-0 drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)] max-md:hidden" />
              <div className="min-w-0 leading-tight max-md:hidden">
                <h1 className="truncate text-[14px] font-semibold tracking-[-0.012em]">{title}</h1>
                <p className="flex items-center gap-1.5 truncate text-[11.5px] text-[var(--d-ink-3)]">
                  <span className="size-2 rounded-full" style={{ background: tagColour(category) }} aria-hidden="true" />
                  {category}
                </p>
              </div>
            </div>

            <div
              role="tablist"
              aria-label={`${title} views`}
              className="d-seg d-toolbar-seg"
              onKeyDown={onKey}
            >
              {VIEWS.map((entry, index) => {
                const selected = entry.id === view
                return (
                  <button
                    key={entry.id}
                    ref={(node) => {
                      tabs.current[index] = node
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${entry.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${entry.id}`}
                    tabIndex={selected ? 0 : -1}
                    className="d-seg-btn"
                    onClick={() => choose(entry.id)}
                  >
                    {selected ? (
                      <motion.span
                        layoutId={`${baseId}-thumb`}
                        className="d-seg-thumb"
                        transition={still ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
                      />
                    ) : null}
                    {entry.label}
                  </button>
                )
              })}
            </div>

            <div className="d-tb-prompt ml-auto max-md:hidden">
              <CopyPromptButton prompt={prompt} componentName={title} />
            </div>
          </div>

          <div className="d-appbody">
            <nav aria-label="Components" className="d-source">
              {sidebar}
            </nav>
            <main id="main-content" ref={scroller} tabIndex={-1} className="d-main">
              <h1 className="d-large-title md:hidden">{title}</h1>
              <div className="flex items-center justify-between gap-3 px-5 pt-1 md:hidden">
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--d-ink-3)]">
                  <span className="size-2 rounded-full" style={{ background: tagColour(category) }} aria-hidden="true" />
                  {category}
                </span>
                <span className="d-tb-prompt">
                  <CopyPromptButton prompt={prompt} componentName={title} />
                </span>
              </div>
              <div className="d-content">
                {VIEWS.map((entry) => (
                  <section
                    key={entry.id}
                    role="tabpanel"
                    id={`${baseId}-panel-${entry.id}`}
                    aria-labelledby={`${baseId}-tab-${entry.id}`}
                    hidden={entry.id !== view}
                    className="d-view"
                  >
                    {views[entry.id]}
                  </section>
                ))}
                <div>{below}</div>
              </div>
              <aside aria-label={`About ${title}`} className="d-inspector">
                {inspector}
              </aside>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The live demo, on a neutral canvas. A client island because the previews are. */
export function LiveCanvas({ slug }: { slug: string }) {
  return <div className="d-canvas">{renderPreview(slug)}</div>
}

/*
 * The overview, set to be read: the first sentence as a standfirst, the rest
 * at reading size on a ~62ch measure, folded past about 120 words so the
 * preview above it stays the thing the page is about.
 */
export function Overview({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  const match = /^(.+?[.!?])\s+(?=[A-Z“"])/.exec(text)
  const lead = match ? match[1] : text
  const rest = match ? text.slice(match[0].length) : ""
  const words = rest.split(/\s+/).filter(Boolean)
  const long = words.length > 120
  const shown = long && !open ? `${words.slice(0, 100).join(" ")}…` : rest

  return (
    <section aria-labelledby={`${id}-h`} className="d-overview">
      <h2 id={`${id}-h`} className="sr-only">
        Overview
      </h2>
      <p className="d-overview-lead">{lead}</p>
      {rest ? (
        <p id={`${id}-rest`} className="d-overview-rest">
          {shown}
        </p>
      ) : null}
      {long ? (
        <button
          type="button"
          className="d-link mt-2 text-[14px] font-medium"
          aria-expanded={open}
          aria-controls={`${id}-rest`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </section>
  )
}
