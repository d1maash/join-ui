"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface IxTabItem {
  id: string
  label: string
  content: React.ReactNode
}

/**
 * Tabs on a mono bar: the WAI-ARIA tabs pattern with roving focus and arrow
 * keys. Panels are server-rendered and only hidden, so switching is instant.
 */
export function IxTabs({
  label,
  items,
  bar,
  className,
  barClassName,
}: {
  label: string
  items: IxTabItem[]
  /** Extra controls at the right end of the bar. */
  bar?: React.ReactNode
  className?: string
  barClassName?: string
}) {
  const [active, setActive] = React.useState(items[0]?.id ?? "")
  const base = React.useId()

  function onKeyDown(event: React.KeyboardEvent) {
    const index = items.findIndex((item) => item.id === active)
    let next = -1
    if (event.key === "ArrowRight") next = (index + 1) % items.length
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = items.length - 1
    if (next < 0) return
    event.preventDefault()
    const id = items[next]!.id
    setActive(id)
    document.getElementById(`${base}-tab-${id}`)?.focus()
  }

  return (
    <div className={className}>
      <div className={cn("flex h-10 items-stretch border-b border-[var(--ix-line)]", barClassName)}>
        <div role="tablist" aria-label={label} className="-ml-3.5 flex" onKeyDown={onKeyDown}>
          {items.map((item) => (
            <button
              key={item.id}
              id={`${base}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={item.id === active}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={item.id === active ? 0 : -1}
              onClick={() => setActive(item.id)}
              className="ix-tab"
            >
              {item.label}
            </button>
          ))}
        </div>
        {bar ? <div className="ml-auto flex items-center gap-1">{bar}</div> : null}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="focus-visible:outline-offset-[-2px]"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
