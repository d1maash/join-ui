"use client"

import * as React from "react"

import type { CommandSet } from "@/lib/commands"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

import { CopyIcon } from "./copy"
import { SegmentedControl } from "./segmented"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/*
 * The choice of package manager is the same preference the rest of the site
 * stores, so picking bun here picks it on every command on every page.
 */
function usePackageManager() {
  return useStoredPreference<PackageManager>(
    "joinui-package-manager",
    "pnpm",
    isPackageManager
  )
}

const MANAGER_OPTIONS = PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }))

/**
 * A command on its own line, with the package manager as a segmented control.
 *
 * `hero` is the cinematic version — a wide pill, the command set large — and
 * `panel` the one that sits in a page of documentation.
 */
export function CommandBox({
  commands,
  label = "Install command",
  appearance = "panel",
  className,
}: {
  commands: CommandSet
  label?: string
  appearance?: "hero" | "panel"
  className?: string
}) {
  const [manager, setManager] = usePackageManager()
  const command = commands[manager]

  if (appearance === "hero") {
    return (
      <div className={cn("flex flex-col items-center gap-6", className)}>
        <SegmentedControl
          options={MANAGER_OPTIONS}
          value={manager}
          onChange={setManager}
          label={`${label}: package manager`}
        />
        <div className="flex w-full max-w-[56rem] items-center gap-2 rounded-full bg-[#161617] py-2 pr-2 pl-6 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1),0_30px_80px_-30px_rgb(41_151_255/0.35)] sm:pl-9">
          <code className="pro-no-scrollbar min-w-0 flex-1 overflow-x-auto py-3 font-mono text-[clamp(0.875rem,1.9vw,1.375rem)] whitespace-nowrap text-[#f5f5f7]">
            <span aria-hidden="true" className="mr-3 text-[#6e6e73] select-none">
              $
            </span>
            {command}
          </code>
          <CopyIcon
            value={command}
            label="Copy command"
            toastMessage="Command copied"
            className="size-12 bg-white/[0.08]"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] bg-[#111112] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] py-2 pr-2 pl-2.5">
        <SegmentedControl
          options={MANAGER_OPTIONS}
          value={manager}
          onChange={setManager}
          label={`${label}: package manager`}
          size="sm"
        />
        <CopyIcon value={command} label="Copy command" toastMessage="Command copied" />
      </div>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-[1.75] text-[#f5f5f7]">
        <code>
          <span aria-hidden="true" className="mr-2.5 text-[#6e6e73] select-none">
            $
          </span>
          {command}
        </code>
      </pre>
    </div>
  )
}
