"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { CopyButton } from "@/components/site/copy-button"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, shadcnAddCommand, siteConfig, type PackageManager } from "@/lib/site"
import { cn } from "@/lib/utils"

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/**
 * The install line, with the package manager and the component both
 * switchable. The manager is the same stored preference every other command
 * on the site reads, so picking `bun` here carries over to the docs.
 */
export function InstallBox({
  options,
  defaultSlug,
  className,
}: {
  options: Array<{ slug: string; title: string }>
  defaultSlug: string
  className?: string
}) {
  const [manager, setManager] = useStoredPreference<PackageManager>(
    "joinui-package-manager",
    "pnpm",
    isPackageManager
  )
  const [slug, setSlug] = React.useState(defaultSlug)
  const command = shadcnAddCommand(`${siteConfig.namespace}/${slug}`, manager)
  const id = React.useId()

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background text-left shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-1 border-b border-border px-1.5 py-1.5">
        <div role="tablist" aria-label="Package manager" className="flex items-center gap-0.5">
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
                  "h-7 cursor-pointer rounded-md px-2.5 text-[12.5px] font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pm}
              </button>
            )
          })}
        </div>
        <label htmlFor={id} className="sr-only">
          Component
        </label>
        <div className="relative ml-auto">
          <select
            id={id}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={cn(
              "h-7 max-w-[11rem] cursor-pointer appearance-none truncate rounded-md border border-border bg-background pr-7 pl-2.5 text-[12.5px] font-medium",
              "text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            )}
          >
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.title}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 py-2 pr-2 pl-4">
        <code className="min-w-0 flex-1 overflow-x-auto py-1 text-[12px] whitespace-nowrap sm:text-[13px] st-noscrollbar">
          <span aria-hidden="true" className="mr-2 text-muted-foreground select-none">
            $
          </span>
          {command}
        </code>
        <CopyButton
          value={command}
          label="Copy install command"
          copiedLabel="Copied"
          toastMessage="Install command copied"
        />
      </div>
    </div>
  )
}
