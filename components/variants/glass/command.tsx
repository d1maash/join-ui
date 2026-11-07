"use client"

import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import type { CommandSet } from "@/lib/commands"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

import { Segmented } from "./segmented"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/**
 * One command in a white well, with the package manager as a segmented
 * control above it. The choice is the site-wide preference — pick `bun` once
 * and every command on every page follows.
 */
export function GlassCommand({
  commands,
  label = "Package manager",
  id,
  className,
}: {
  commands: CommandSet
  label?: string
  /** Namespaces the segmented control's lens; generated when omitted. */
  id?: string
  className?: string
}) {
  const [manager, setManager] = useStoredPreference<PackageManager>(
    "joinui-package-manager",
    "pnpm",
    isPackageManager
  )
  const command = commands[manager]

  return (
    <div className={cn("g-inset overflow-hidden rounded-[22px]", className)}>
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-2 py-2">
        <Segmented
          id={id}
          label={label}
          size="sm"
          options={PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }))}
          value={manager}
          onChange={setManager}
        />
        <CopyButton
          value={command}
          label="Copy command"
          copiedLabel="Copied"
          toastMessage="Command copied"
          className="ml-auto rounded-full text-[#3a3a3e] hover:bg-black/[0.05]"
        />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-[#1d1d1f]">
        <code>
          <span aria-hidden="true" className="mr-2 text-[#0a7d5a] select-none">
            $
          </span>
          {command}
        </code>
      </pre>
    </div>
  )
}
