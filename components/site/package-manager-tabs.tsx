"use client"

import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import type { CommandSet } from "@/lib/commands"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/**
 * Install command with a package-manager switch.
 *
 * The choice is stored under one shared key, so picking `bun` on the
 * installation page keeps every other snippet on the site in `bun` too.
 */
export function PackageManagerTabs({
  commands,
  label = "Install command",
  className,
}: {
  commands: CommandSet
  label?: string
  className?: string
}) {
  const [manager, setManager] = useStoredPreference<PackageManager>(
    "joinui-package-manager",
    "pnpm",
    isPackageManager
  )

  const command = commands[manager]

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-code-bg shadow-xs",
        className
      )}
    >
      <div
        role="tablist"
        aria-label={label}
        className="flex h-9 items-stretch gap-1 border-b border-border bg-card/40 px-1.5 py-1.5"
      >
        {PACKAGE_MANAGERS.map((pm) => {
          const active = pm === manager
          return (
            <button
              key={pm}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setManager(pm)}
              className={cn(
                "label-caps cursor-pointer rounded-md px-2.5 transition-colors",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                active
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {pm}
            </button>
          )
        })}
        <span className="flex-1" />
        <CopyButton
          value={command}
          label="Copy command"
          copiedLabel="Copied"
          toastMessage="Command copied"
          className="my-0.5 mr-0.5 self-center"
        />
      </div>

      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.8125rem] leading-[1.7]">
        <code>
          <span aria-hidden="true" className="mr-2 text-muted-foreground select-none">
            $
          </span>
          {command}
        </code>
      </pre>
    </div>
  )
}
