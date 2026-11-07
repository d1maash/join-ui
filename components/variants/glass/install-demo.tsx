"use client"

import * as React from "react"

import { CopyButton } from "@/components/site/copy-button"
import { useStoredPreference } from "@/lib/hooks"
import {
  PACKAGE_MANAGERS,
  shadcnAddCommand,
  siteConfig,
  type PackageManager,
} from "@/lib/site"

import { Segmented } from "./segmented"

export interface InstallDemoItem {
  slug: string
  title: string
  dependencies: string[]
  target: string
}

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/**
 * A terminal window on glass: pick a package manager and a component, and the
 * command and what the CLI reports back follow. The package manager is the
 * site-wide preference, so the choice made here carries into every install
 * snippet in the docs and on the component pages.
 */
export function InstallDemo({ items }: { items: InstallDemoItem[] }) {
  const [manager, setManager] = useStoredPreference<PackageManager>(
    "joinui-package-manager",
    "pnpm",
    isPackageManager
  )
  const [slug, setSlug] = React.useState(items[0]?.slug ?? "")
  const item = items.find((entry) => entry.slug === slug) ?? items[0]
  if (!item) return null

  const command = shadcnAddCommand(`${siteConfig.namespace}/${item.slug}`, manager)
  const output = [
    "✔ Checking registry.",
    item.dependencies.length > 0
      ? `✔ Installing dependencies: ${item.dependencies.join(", ")}`
      : "✔ No dependencies to install.",
    "✔ Created 1 file:",
    `  - ${item.target}`,
  ]

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="g-glass g-thick overflow-hidden rounded-[30px]">
        <div className="flex flex-wrap items-center gap-3 border-b border-black/[0.06] px-4 py-3 sm:px-5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.15)]" />
            <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.15)]" />
            <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.15)]" />
          </span>
          <span className="hidden text-[13px] font-medium text-[#56565b] sm:inline">
            my-app — zsh
          </span>
          <Segmented
            id="g-install-pm"
            label="Package manager"
            size="sm"
            className="ml-auto"
            options={PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }))}
            value={manager}
            onChange={setManager}
          />
        </div>

        <div className="g-inset m-2 rounded-[22px] px-4 py-4 font-mono text-[13px] leading-[1.75] sm:px-5">
          <div className="flex items-start gap-3">
            <p className="min-w-0 flex-1 break-all text-[#1d1d1f]">
              <span aria-hidden="true" className="mr-2 text-[#0a7d5a] select-none">
                ~/my-app $
              </span>
              {command}
            </p>
            <CopyButton
              value={command}
              label="Copy command"
              copiedLabel="Copied"
              toastMessage="Command copied"
              className="-mt-1 -mr-2 rounded-full text-[#3a3a3e] hover:bg-black/[0.05]"
            />
          </div>
          <div key={`${manager}-${item.slug}`} className="mt-1">
            {output.map((line, index) => (
              <p
                key={line}
                className="g-type-in whitespace-pre-wrap text-[#56565b]"
                style={{ animationDelay: `${120 + index * 140}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
        <Segmented
          id="g-install-item"
          label="Component to install"
          size="sm"
          options={items.map((entry) => ({ value: entry.slug, label: entry.title }))}
          value={item.slug}
          onChange={setSlug}
        />
      </div>
    </div>
  )
}
