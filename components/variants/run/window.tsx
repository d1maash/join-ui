"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight, Lock, RotateCw } from "lucide-react"

import { cn } from "@/lib/utils"

const EASE = [0.32, 0.72, 0, 1] as const
const FOLD = { duration: 0.7, ease: EASE }

/** Grey until the pointer comes to them, the way an inactive Mac window draws them. */
export function TrafficLights({
  small = false,
  className,
}: {
  small?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("run-lights", small && "run-lights--sm", className)}
    >
      <span />
      <span />
      <span />
    </span>
  )
}

/*
 * The application window, laid out the way a Mac app is: a sidebar running the
 * full height under the traffic lights, one unified toolbar, a main column with
 * the composer along its foot, and an inspector on the right. In `browser` mode
 * the sidebar, the inspector and the composer all fold away and the toolbar
 * becomes an address bar — the same frame turns into the browser the agent's
 * work is shown in, rather than being swapped for another window.
 */
export function RunWindow({
  mode = "app",
  sidebar,
  sidebarWidth = 200,
  inspector,
  inspectorWidth = 236,
  footer,
  toolbar,
  url,
  className,
  style,
  flat = false,
  children,
  label,
}: {
  mode?: "app" | "browser"
  sidebar?: React.ReactNode
  sidebarWidth?: number
  inspector?: React.ReactNode
  inspectorWidth?: number
  /** Runs along the foot of the main column — the composer. */
  footer?: React.ReactNode
  toolbar?: React.ReactNode
  url?: string
  className?: string
  style?: React.CSSProperties
  flat?: boolean
  children: React.ReactNode
  /** Accessible name of the window region. */
  label?: string
}) {
  const browser = mode === "browser"
  const sidebarShown = Boolean(sidebar) && !browser
  const inspectorShown = Boolean(inspector) && !browser
  const footerShown = Boolean(footer) && !browser

  return (
    <div
      role="region"
      aria-label={label}
      className={cn("run-window", flat && "run-window--flat", className)}
      style={style}
    >
      {sidebar ? (
        <motion.div
          className="run-sidebar"
          initial={false}
          animate={{ width: sidebarShown ? sidebarWidth : 0 }}
          transition={FOLD}
        >
          <div
            className="flex h-full flex-col"
            style={{ width: sidebarWidth }}
            inert={!sidebarShown || undefined}
          >
            <div className="h-[3.25rem] shrink-0" />
            {sidebar}
          </div>
        </motion.div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <motion.div
          className="run-toolbar"
          initial={false}
          animate={{ paddingLeft: sidebarShown ? 16 : 88 }}
          transition={FOLD}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {browser ? (
              <motion.div
                key="browser"
                className="flex min-w-0 flex-1 items-center gap-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, delay: 0.12, ease: EASE },
                }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.16, ease: EASE } }}
              >
                <span
                  className="flex shrink-0 items-center gap-1 text-[#5c5c61]"
                  aria-hidden="true"
                >
                  <ChevronLeft className="size-4" />
                  <ChevronRight className="size-4" />
                </span>
                <div className="run-urlbar mx-auto w-full max-w-[24rem]">
                  <Lock aria-hidden="true" className="size-3 text-[#77777c]" />
                  <span className="truncate text-[#c7c7cc]">{url}</span>
                </div>
                <RotateCw
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-[#5c5c61]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="app"
                className="flex min-w-0 flex-1 items-center gap-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, delay: 0.12, ease: EASE },
                }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.16, ease: EASE } }}
              >
                {toolbar}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">{children}</div>
            {footer ? (
              <motion.div
                className="shrink-0 overflow-hidden"
                initial={false}
                animate={{
                  height: footerShown ? "auto" : 0,
                  opacity: footerShown ? 1 : 0,
                }}
                transition={FOLD}
                inert={!footerShown || undefined}
              >
                {footer}
              </motion.div>
            ) : null}
          </div>

          {inspector ? (
            <motion.div
              className="run-inspector"
              initial={false}
              animate={{ width: inspectorShown ? inspectorWidth : 0 }}
              transition={FOLD}
            >
              <div
                className="h-full"
                style={{ width: inspectorWidth }}
                inert={!inspectorShown || undefined}
              >
                {inspector}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <TrafficLights className="absolute top-5 left-4 z-10" />
    </div>
  )
}

/** A small framed window, for the cast, the catalog and related components. */
export function MiniWindow({
  title,
  className,
  children,
}: {
  title?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("run-mini", className)}>
      <div className="run-mini-bar">
        <TrafficLights small />
        {title ? <span>{title}</span> : <span />}
      </div>
      {children}
    </div>
  )
}
