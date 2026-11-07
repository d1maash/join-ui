"use client"

import * as React from "react"

import type { CommandSet } from "@/lib/commands"
import { PACKAGE_MANAGERS } from "@/lib/site"
import { cn } from "@/lib/utils"

import { IxCopyButton, usePackageManager } from "./copy"

/**
 * A command with a package-manager switch, in a box with a mono bar. The
 * choice is the site-wide one, so switching here switches every command and
 * every cell's Copy button too.
 */
export function IxCommand({
  commands,
  label = "Install command",
  title,
  className,
}: {
  commands: CommandSet
  label?: string
  /** Optional caption at the right of the bar, before the copy button. */
  title?: string
  className?: string
}) {
  const [manager, setManager] = usePackageManager()
  const command = commands[manager]
  const id = React.useId()

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = PACKAGE_MANAGERS.indexOf(manager)
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = PACKAGE_MANAGERS[(index + delta + PACKAGE_MANAGERS.length) % PACKAGE_MANAGERS.length]!
    setManager(next)
    document.getElementById(`${id}-${next}`)?.focus()
  }

  return (
    <div className={cn("ix-codebox", className)}>
      <div className="ix-codebar !pl-1">
        <div role="tablist" aria-label={label} className="flex h-full" onKeyDown={onKeyDown}>
          {PACKAGE_MANAGERS.map((pm) => (
            <button
              key={pm}
              id={`${id}-${pm}`}
              type="button"
              role="tab"
              aria-selected={pm === manager}
              tabIndex={pm === manager ? 0 : -1}
              onClick={() => setManager(pm)}
              className="ix-pm"
            >
              {pm}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        {title ? <span className="ix-mono ix-fg-3 hidden truncate sm:inline">{title}</span> : null}
        <IxCopyButton
          value={command}
          label="Copy command"
          copiedLabel="Copied"
          toastMessage="Command copied"
          hideLabel
        />
      </div>
      <code className="ix-cmd" role="tabpanel">
        <span aria-hidden="true" className="ix-fg-3 mr-3 select-none">
          $
        </span>
        {command}
      </code>
    </div>
  )
}
