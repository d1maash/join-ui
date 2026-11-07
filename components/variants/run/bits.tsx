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
export function RunThumb({ slug, scale, height }: { slug: string; scale: number; height: number }) {
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
        <div className="run-seg !bg-transparent !shadow-none" role="group" aria-label={label}>
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
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.6] text-[#f5f5f7] [scrollbar-width:thin]">
        <span className="text-[#48484c] select-none" aria-hidden="true">
          ${" "}
        </span>
        {command}
      </pre>
    </div>
  )
}
