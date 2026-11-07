"use client"

import * as React from "react"
import { motion } from "motion/react"

import { renderPreview } from "@/components/previews/registry"
import { renderThumb } from "@/components/previews/thumbs/registry"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"

import { RunCopy } from "./copy"

/** The registered demo for a slug. A client boundary, because the lookup is one. */
export function RunPreview({ slug }: { slug: string }) {
  return <>{renderPreview(slug)}</>
}

/** A thumbnail drawn at its own size and scaled into whatever holds it. */
export function RunThumb({
  slug,
  scale,
  height,
}: {
  slug: string
  scale: number
  height: number
}) {
  return (
    <div
      className="run-thumb-frame dark bg-background"
      style={{ height, "--run-thumb-scale": scale } as React.CSSProperties}
      inert
      aria-hidden="true"
    >
      <div>{renderThumb(slug)}</div>
    </div>
  )
}

/** A command for each package manager, behind one switch. */
export function CommandSwitch({
  commands,
  label,
}: {
  commands: Record<PackageManager, string>
  label: string
}) {
  const [pm, setPm] = React.useState<PackageManager>("pnpm")
  const id = React.useId()
  const command = commands[pm]
  return (
    <div className="run-code">
      <div className="run-code-head !pl-1.5">
        <div
          className="run-seg !bg-transparent !shadow-none"
          role="group"
          aria-label={label}
        >
          {PACKAGE_MANAGERS.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={pm === entry}
              onClick={() => setPm(entry)}
            >
              {pm === entry ? (
                <motion.span
                  layoutId={`${id}-pm`}
                  className="run-seg-thumb"
                  transition={{ type: "spring", visualDuration: 0.3, bounce: 0.12 }}
                />
              ) : null}
              {entry}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <RunCopy
          value={command}
          label="Copy command"
          variant="ghost"
          size="sm"
          iconOnly
          toastMessage="Command copied"
        />
      </div>
      <pre className="[scrollbar-width:thin] overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.6] text-[#f5f5f7]">
        <span className="text-[#48484c] select-none" aria-hidden="true">
          ${" "}
        </span>
        {command}
      </pre>
    </div>
  )
}

/** A paragraph that shows its first part and keeps the rest behind "Read more". */
export function ReadMore({
  shown,
  rest,
  className,
}: {
  shown: React.ReactNode
  rest: React.ReactNode | null
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  return (
    <div className={className}>
      <p>
        {shown}
        {rest && open ? <span id={id}> {rest}</span> : null}
      </p>
      {rest ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={() => setOpen((value) => !value)}
          className="run-btn run-btn--ghost run-btn--sm mt-3 -ml-2.5"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  )
}

/** A numbered list that shows its first few entries and the rest on request. */
export function ExpandList({
  items,
  visible = 4,
  className,
  noun = "notes",
}: {
  items: React.ReactNode[]
  visible?: number
  className?: string
  noun?: string
}) {
  const [open, setOpen] = React.useState(false)
  const shown = open ? items : items.slice(0, visible)
  return (
    <div>
      <ol className={className}>{shown}</ol>
      {items.length > visible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="run-btn run-btn--quiet run-btn--sm mt-5"
        >
          {open ? "Show fewer" : `Show all ${items.length} ${noun}`}
        </button>
      ) : null}
    </div>
  )
}
