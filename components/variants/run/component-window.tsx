"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Maximize2 } from "lucide-react"

import { cn } from "@/lib/utils"

import { TrafficLights } from "./window"

export interface WindowTab {
  id: string
  label: string
  content: React.ReactNode
}

/*
 * The component page's one big object: the component, live, in a window. The
 * window's toolbar is where you change what it shows — the running thing, its
 * source, how to install it, the brief for an agent — the way a Mac window's
 * segmented control switches views without leaving the window.
 */
export function ComponentWindow({
  title,
  tabs,
  fullPreview,
}: {
  title: string
  tabs: WindowTab[]
  fullPreview: string
}) {
  const [active, setActive] = React.useState(tabs[0]?.id ?? "preview")
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])
  const id = React.useId()

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active)
    let next = -1
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = tabs.length - 1
    if (next < 0) return
    event.preventDefault()
    const tab = tabs[next]
    if (!tab) return
    setActive(tab.id)
    refs.current[next]?.focus()
  }

  return (
    <div className="run-window flex-col">
      <div className="run-toolbar justify-between gap-3 !pr-2 !pl-4 max-sm:!h-auto max-sm:flex-wrap max-sm:py-3">
        <div className="flex min-w-0 items-center gap-4 sm:w-[14rem]">
          <TrafficLights />
          <span className="truncate font-mono text-[12px] text-[#77777c] max-lg:hidden">
            {title}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="View"
          className="run-seg max-sm:order-last max-sm:w-full max-sm:justify-between"
          onKeyDown={onKeyDown}
        >
          {tabs.map((tab, index) => {
            const selected = tab.id === active
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  refs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className="max-sm:flex-1"
              >
                {selected ? (
                  <motion.span
                    layoutId={`${id}-thumb`}
                    className="run-seg-thumb"
                    transition={{ type: "spring", visualDuration: 0.3, bounce: 0.12 }}
                  />
                ) : null}
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-end sm:w-[14rem]">
          <Link
            href={fullPreview}
            className="run-btn run-btn--ghost run-btn--sm run-btn--icon"
            aria-label="Open the full-page preview"
            title="Full preview"
          >
            <Maximize2 aria-hidden="true" />
          </Link>
        </div>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${id}-panel-${tab.id}`}
          aria-labelledby={`${id}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className={cn("relative min-w-0 focus-visible:outline-offset-[-4px]")}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
