"use client"

import * as React from "react"

import { renderPreview } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

import { Segmented } from "./segmented"

/*
 * The product shot: the component's live workbench on a large grey stage, the
 * way Apple sets a device on a seamless backdrop. `renderPreview` reaches into
 * a client module of dynamic imports, so this has to be a client component.
 */
export function AirStage({ slug, className }: { slug: string; className?: string }) {
  const demo = renderPreview(slug)
  return (
    <div
      className={cn(
        "flex min-h-[26rem] items-center justify-center overflow-hidden rounded-[32px] bg-[#f5f5f7] px-4 py-12 text-[#1d1d1f] sm:px-10 sm:py-16 lg:px-14",
        className
      )}
    >
      {demo ?? (
        <p className="max-w-sm text-center text-[15px] text-[#6e6e73]">
          No live preview is registered for this component yet.
        </p>
      )}
    </div>
  )
}

/** Source files behind a segmented control, when a component has more than one. */
export function AirCodeTabs({
  label,
  items,
}: {
  label: string
  items: Array<{ value: string; label: string; content: React.ReactNode }>
}) {
  const [value, setValue] = React.useState(items[0]?.value ?? "")
  const idPrefix = React.useId()

  if (items.length <= 1) return <>{items[0]?.content}</>

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        mode="tabs"
        label={label}
        idPrefix={idPrefix}
        value={value}
        onChange={setValue}
        options={items.map((item) => ({ value: item.value, label: item.label }))}
        className="self-start"
      />
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${idPrefix}-panel-${item.value}`}
          aria-labelledby={`${idPrefix}-tab-${item.value}`}
          hidden={item.value !== value}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

/** The prompt, shown the way a long document is: the top of it, and a way to read on. */
export function PromptPeek({ prompt, lines }: { prompt: string; lines: number }) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#1c1c1e] text-left shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <div className="flex h-11 items-center gap-1.5 border-b border-white/[0.08] px-5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <pre
        id={id}
        className={cn(
          "overflow-x-auto px-6 pt-5 pb-6 font-mono text-[12.5px] leading-[1.7] whitespace-pre-wrap text-[#d1d1d6]",
          !open && "max-h-[22rem] overflow-y-hidden [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
        )}
      >
        {prompt}
      </pre>
      <div className="flex justify-center border-t border-white/[0.08] py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="cursor-pointer rounded-full px-3 py-1.5 text-[14px] text-[#2997ff] hover:underline focus-visible:outline-2 focus-visible:outline-[#2997ff]"
        >
          {open ? "Show less" : `Read all ${lines} lines`}
        </button>
      </div>
    </div>
  )
}
