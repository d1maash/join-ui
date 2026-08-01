"use client"

import * as React from "react"

import { CopyButton } from "@/components/docs/copy-button"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "joinway-package-manager"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

export interface PackageManagerTabsClientProps {
  commands: Record<PackageManager, string>
  /** Pre-highlighted markup, keyed by package manager. */
  html: Record<PackageManager, string>
  className?: string
  label?: string
}

/**
 * Package-manager switcher.
 *
 * The choice is remembered in `localStorage` and applied after mount rather
 * than during render, so the server and first client render always agree and
 * hydration stays clean. Implements the ARIA tabs pattern with manual
 * activation via arrow keys.
 */
export function PackageManagerTabsClient({
  commands,
  html,
  className,
  label = "Package manager",
}: PackageManagerTabsClientProps) {
  // Shared store, so every switcher on the page — and in every other tab —
  // stays on the same package manager.
  const [active, select] = useStoredPreference<PackageManager>(
    STORAGE_KEY,
    "pnpm",
    isPackageManager
  )
  const listRef = React.useRef<HTMLDivElement>(null)
  const baseId = React.useId()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = PACKAGE_MANAGERS.indexOf(active)
    let index = -1
    if (event.key === "ArrowRight") index = (current + 1) % PACKAGE_MANAGERS.length
    else if (event.key === "ArrowLeft")
      index = (current - 1 + PACKAGE_MANAGERS.length) % PACKAGE_MANAGERS.length
    else if (event.key === "Home") index = 0
    else if (event.key === "End") index = PACKAGE_MANAGERS.length - 1
    else return

    event.preventDefault()
    const next = PACKAGE_MANAGERS[index]
    if (!next) return
    select(next)
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [index]?.focus()
  }

  const panelId = `${baseId}-panel`

  return (
    <div
      className={cn(
        "my-4 overflow-hidden rounded-xl border border-border bg-code-bg",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 pl-1.5 pr-1.5">
        <div
          ref={listRef}
          role="tablist"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-0.5 overflow-x-auto py-1.5"
        >
          {PACKAGE_MANAGERS.map((manager) => (
            <button
              key={manager}
              type="button"
              role="tab"
              id={`${baseId}-tab-${manager}`}
              aria-selected={manager === active}
              aria-controls={panelId}
              tabIndex={manager === active ? 0 : -1}
              onClick={() => select(manager)}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1 font-mono text-xs transition-colors duration-[var(--duration-instant)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                manager === active
                  ? "bg-card text-foreground shadow-[var(--shadow-subtle)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {manager}
            </button>
          ))}
        </div>
        <CopyButton
          value={commands[active]}
          label={`Copy ${active} command`}
          toastMessage="Install command copied"
        />
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className={cn(
          "[&_pre]:overflow-x-auto [&_pre]:py-3 [&_pre]:text-[0.8125rem] [&_pre]:leading-relaxed",
          "[&_code]:font-mono"
        )}
        // Shiki output generated on the server from a fixed command template.
        dangerouslySetInnerHTML={{ __html: html[active] }}
      />
    </div>
  )
}
