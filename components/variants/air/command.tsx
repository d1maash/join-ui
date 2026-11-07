"use client"

import * as React from "react"

import type { CommandSet } from "@/lib/commands"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

import { AirCopy } from "./copy"
import { Segmented } from "./segmented"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/*
 * One command, four package managers. The choice is stored under the same key
 * the original site uses, so picking `bun` once carries across every command
 * in every variant.
 */
export function AirCommand({
  commands,
  label = "Package manager",
  tone = "band",
  className,
}: {
  commands: CommandSet
  label?: string
  /** `band` sits on #f5f5f7 (white panel); `white` sits on white (grey panel). */
  tone?: "band" | "white"
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
        "min-w-0 overflow-hidden rounded-[18px] text-left",
        tone === "band"
          ? "bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_2px_8px_rgb(0_0_0/0.04)]"
          : "bg-[#f5f5f7]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <Segmented
          label={label}
          value={manager}
          onChange={setManager}
          options={PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }))}
        />
        <AirCopy
          value={command}
          label="Copy command"
          copiedLabel="Copied"
          toastMessage="Command copied"
          iconOnly
        />
      </div>
      <pre className="overflow-x-auto px-5 pt-3 pb-4 font-mono text-[13.5px] leading-[1.6] text-[#1d1d1f]">
        <code>
          <span aria-hidden="true" className="mr-2.5 text-[#86868b] select-none">
            $
          </span>
          {command}
        </code>
      </pre>
    </div>
  )
}
