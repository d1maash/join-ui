"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"

import { vh } from "./apps"

/*
 * A system app, maximised: the same window the component pages use — a
 * margin of wallpaper all round, a unified toolbar, a source list and one
 * readable pane — for the Catalog and the Docs reader. Close and minimise
 * go back to the desktop; zoom takes the margins away.
 */
export function MaxWindow({
  title,
  label,
  heading,
  center,
  right,
  sidebar,
  sidebarLabel,
  children,
  mainClassName,
  mainRef,
}: {
  /** The app name, used in the controls' accessible names. */
  title: string
  label: string
  /** What sits beside the traffic lights: icon, name, subtitle. */
  heading: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  sidebar: React.ReactNode
  sidebarLabel: string
  children: React.ReactNode
  mainClassName?: string
  mainRef?: React.Ref<HTMLElement>
}) {
  const [full, setFull] = React.useState(false)

  return (
    <div className={cn("d-stage d-desk-only", full && "d-stage-full")}>
      <div className="d-appwin d-glass" role="region" aria-label={label}>
        <div className="d-win-clip">
          <div className="d-toolbar">
            <StageLights title={title} full={full} onZoom={() => setFull((value) => !value)} />
            <div className="flex min-w-0 items-center gap-2.5 pl-2">{heading}</div>
            {center ? <div className="d-toolbar-seg">{center}</div> : null}
            {right ? <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div> : null}
          </div>
          <div className="d-appbody">
            <nav aria-label={sidebarLabel} className="d-source">
              {sidebar}
            </nav>
            <main id="main-content" ref={mainRef} tabIndex={-1} className={cn("d-pane-main", mainClassName)}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StageLights({
  title,
  full,
  onZoom,
}: {
  title: string
  full: boolean
  onZoom: () => void
}) {
  return (
    <div className="d-lights">
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
        onClick={onZoom}
      >
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2.6 6.9V2.6h4.3zM7.4 3.1v4.3H3.1z" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}

/** The phone's version of an app: a navigation bar back home, then the page. */
export function PhoneApp({
  title,
  children,
  trailing,
}: {
  title: string
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div className="d-phone-only relative min-h-[calc(100dvh-48px)] bg-[#0d0d10]">
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between bg-[rgb(13_13_16/0.86)] px-1 backdrop-blur-xl">
        <Link href={vh("/")} className="d-back-phone">
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2.3} />
          Home
        </Link>
        {trailing}
      </div>
      <main id="main-content-phone" tabIndex={-1} className="outline-none">
        <h1 className="px-5 pt-1 pb-3 text-[34px] font-bold tracking-[-0.025em]">{title}</h1>
        {children}
      </main>
    </div>
  )
}
