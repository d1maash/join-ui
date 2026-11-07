"use client"

import * as React from "react"
import { animate, motion, useDragControls, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

import type { AppId } from "./apps"
import { useStill } from "./hooks"
import { useOs } from "./os"

/*
 * A window.
 *
 * It sits at a resting frame written in CSS, so the server can lay the
 * desktop out and the first paint is already composed; everything the hand
 * does to it afterwards is a transform on top of that frame. Dragging moves
 * it by the title bar, inside the desktop. A press anywhere raises it.
 *
 * Opening from the Dock it grows out of the icon on a spring, and closing or
 * minimising it falls back into the icon — a quick, accelerating flight that
 * is the genie's job description without its distortion. Zoom is a FLIP: the
 * window takes its maximised frame at once and is scaled back from where it
 * was to where it now is. Under reduced motion all of it is a short fade.
 */

export interface WindowProps {
  id: AppId
  title: string
  subtitle?: React.ReactNode
  /** The resting frame: left/top/right/bottom and width, in any CSS units. */
  frame: React.CSSProperties
  /** The desktop, which is both the drag boundary and the zoom target. */
  desk: React.RefObject<HTMLDivElement | null>
  kind?: "window" | "widget"
  /** Controls at the right of the title bar. */
  toolbar?: React.ReactNode
  /** The status bar along the bottom. */
  footer?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}

const FLY_IN = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const
const FLY_OUT = { duration: 0.34, ease: [0.55, 0.05, 0.85, 0.35] } as const

export function Window({
  id,
  title,
  subtitle,
  frame,
  desk,
  kind = "window",
  toolbar,
  footer,
  className,
  bodyClassName,
  children,
}: WindowProps) {
  const os = useOs()
  const still = useStill()
  const win = os.wins[id]
  const status = win?.status ?? "closed"
  const zoomed = win?.zoomed ?? false
  const key = os.focused === id

  const ref = React.useRef<HTMLElement>(null)
  const titleId = React.useId()
  const controls = useDragControls()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const scaleX = useMotionValue(1)
  const scaleY = useMotionValue(1)
  const opacity = useMotionValue(0)

  /** Where the window rests when it is not flying — the drag offset. */
  const rest = React.useRef({ x: 0, y: 0 })
  const [shown, setShown] = React.useState(false)
  const first = React.useRef<DOMRect | null>(null)
  const previous = React.useRef<typeof status | null>(null)

  /* The point, in the window's own translate space, that puts it on its Dock icon. */
  const dockOffset = React.useCallback(() => {
    const node = ref.current
    const icon = os.dockIcon(id)
    const area = desk.current
    if (!node || !icon || !area) return null
    const box = area.getBoundingClientRect()
    const target = icon.getBoundingClientRect()
    const cx = box.left + node.offsetLeft + node.offsetWidth / 2
    const cy = box.top + node.offsetTop + node.offsetHeight / 2
    return {
      x: target.left + target.width / 2 - cx,
      y: target.top + target.height / 2 - cy,
    }
  }, [desk, id, os])

  /* Open and close, choreographed off the status the window server holds. */
  React.useEffect(() => {
    const was = previous.current
    previous.current = status
    if (was === status) return

    if (status === "open") {
      setShown(true)
      const via = win?.via ?? "other"
      const from = via === "dock" && !still ? dockOffset() : null
      if (still) {
        x.set(rest.current.x)
        y.set(rest.current.y)
        scale.set(1)
        void animate(opacity, 1, { duration: 0.16 })
      } else if (from) {
        x.set(from.x)
        y.set(from.y)
        scale.set(0.1)
        opacity.set(0)
        void animate(x, rest.current.x, FLY_IN)
        void animate(y, rest.current.y, FLY_IN)
        void animate(scale, 1, FLY_IN)
        void animate(opacity, 1, { duration: 0.16 })
      } else {
        x.set(rest.current.x)
        y.set(rest.current.y + 10)
        scale.set(0.94)
        opacity.set(0)
        void animate(y, rest.current.y, { type: "spring", stiffness: 420, damping: 36 })
        void animate(scale, 1, { type: "spring", stiffness: 420, damping: 36 })
        void animate(opacity, 1, { duration: 0.2 })
      }
      if (via !== "boot") {
        requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }))
      }
      return
    }

    /* Closing or minimising. Nothing to do if it was never on screen. */
    if (was === null) return
    if (!zoomed) rest.current = { x: x.get(), y: y.get() }
    const to = still ? null : dockOffset()
    const done = () => setShown(false)
    if (!to) {
      void animate(opacity, 0, { duration: 0.14 }).then(done)
      return
    }
    void animate(x, to.x, FLY_OUT)
    void animate(y, to.y, FLY_OUT)
    void animate(scale, 0.08, FLY_OUT)
    void animate(opacity, 0, { duration: 0.34, ease: [0.7, 0, 1, 1] }).then(done)
  }, [status, win?.via, still, dockOffset, x, y, scale, opacity, zoomed])

  /* Zoom, as a FLIP from the frame measured just before the switch. */
  React.useLayoutEffect(() => {
    const from = first.current
    const node = ref.current
    const area = desk.current
    first.current = null
    if (!from || !node || !area) return
    const box = area.getBoundingClientRect()
    const target = zoomed ? { x: 0, y: 0 } : rest.current
    const w = node.offsetWidth
    const h = node.offsetHeight
    const cx = box.left + node.offsetLeft + w / 2
    const cy = box.top + node.offsetTop + h / 2
    if (still) {
      x.set(target.x)
      y.set(target.y)
      return
    }
    x.set(from.left + from.width / 2 - cx)
    y.set(from.top + from.height / 2 - cy)
    scaleX.set(from.width / w)
    scaleY.set(from.height / h)
    const spring = { type: "spring", stiffness: 420, damping: 40 } as const
    void animate(x, target.x, spring)
    void animate(y, target.y, spring)
    void animate(scaleX, 1, spring)
    void animate(scaleY, 1, spring)
  }, [zoomed, desk, still, x, y, scaleX, scaleY])

  const zoom = () => {
    const node = ref.current
    if (!node) return
    if (!zoomed) rest.current = { x: x.get(), y: y.get() }
    first.current = node.getBoundingClientRect()
    os.toggleZoom(id)
  }

  const closeWith = (action: "close" | "minimize") => (event: React.MouseEvent) => {
    event.stopPropagation()
    const viaKeyboard = event.detail === 0
    if (action === "close") os.close(id)
    else os.minimize(id)
    if (viaKeyboard) {
      const icon = os.dockIcon(id)?.querySelector<HTMLElement>("button, a")
      icon?.focus({ preventScroll: true })
    }
  }

  if (!win?.mounted) return null

  const visible = shown || status === "open"
  const widget = kind === "widget"

  return (
    <motion.section
      ref={ref}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-app={id}
      data-key={key}
      inert={!visible || status !== "open"}
      className={cn(
        "d-win d-glass outline-none",
        widget ? "d-widget" : "",
        zoomed && "d-win-zoomed",
        className
      )}
      style={{
        ...(zoomed ? ZOOMED : frame),
        zIndex: win.z,
        x,
        y,
        scale,
        scaleX,
        scaleY,
        opacity,
        visibility: visible ? "visible" : "hidden",
      }}
      drag={!zoomed}
      dragControls={controls}
      dragListener={widget}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={desk}
      onDragEnd={() => {
        rest.current = { x: x.get(), y: y.get() }
      }}
      onPointerDownCapture={() => {
        if (!key || os.focused !== id) os.focus(id)
      }}
      onFocusCapture={() => {
        if (os.focused !== id) os.focus(id)
      }}
    >
      <div className="d-win-clip">
        {widget ? (
          <>
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
          </>
        ) : (
          <>
            <div
              className="d-titlebar"
              onPointerDown={(event) => {
                const target = event.target as HTMLElement
                if (target.closest("button, a, input, [data-no-drag]")) return
                if (!zoomed) controls.start(event)
              }}
              onDoubleClick={(event) => {
                const target = event.target as HTMLElement
                if (target.closest("button, a, input, [data-no-drag]")) return
                zoom()
              }}
            >
              <div className="d-lights">
                <button
                  type="button"
                  className="d-light"
                  data-c="close"
                  aria-label={`Close ${title}`}
                  onClick={closeWith("close")}
                >
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M2.6 2.6l4.8 4.8M7.4 2.6 2.6 7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="d-light"
                  data-c="min"
                  aria-label={`Minimise ${title}`}
                  onClick={closeWith("minimize")}
                >
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M2.2 5h5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="d-light"
                  data-c="zoom"
                  aria-label={zoomed ? `Restore ${title}` : `Zoom ${title}`}
                  aria-pressed={zoomed}
                  onClick={(event) => {
                    event.stopPropagation()
                    zoom()
                  }}
                >
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M2.6 6.9V2.6h4.3zM7.4 3.1v4.3H3.1z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="flex min-w-0 flex-1 items-baseline gap-2 pl-1">
                <h2 id={titleId} className="d-title">
                  {title}
                </h2>
                {subtitle ? <span className="d-subtitle truncate">{subtitle}</span> : null}
              </div>
              {toolbar ? <div className="flex shrink-0 items-center gap-1.5">{toolbar}</div> : null}
            </div>
            <div className={cn("d-pane relative flex min-h-0 flex-1 flex-col", bodyClassName)}>
              {children}
            </div>
            {footer ? <div className="d-statusbar">{footer}</div> : null}
          </>
        )}
      </div>
    </motion.section>
  )
}

const ZOOMED: React.CSSProperties = {
  left: 10,
  top: 10,
  right: 10,
  bottom: "var(--d-dock-space)",
  width: "auto",
  height: "auto",
}
