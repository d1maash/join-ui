"use client"

import * as React from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Check, ChevronDown, Copy, Sparkles } from "lucide-react"

import { copyToClipboard } from "@/lib/clipboard"
import {
  PACKAGE_MANAGERS,
  shadcnAddCommand,
  siteConfig,
  type PackageManager,
} from "@/lib/site"

interface Item {
  slug: string
  title: string
}

/** A short brief for a coding agent — enough to install it and use it well. */
function agentPrompt(item: Item, pm: PackageManager) {
  return `Add the ${item.title} component from Join UI to this project.

1. Install it with the shadcn CLI:
   ${shadcnAddCommand(`${siteConfig.url}/r/${item.slug}.json`, pm)}
   (If components.json already maps the ${siteConfig.namespace} namespace, \`${shadcnAddCommand(`${siteConfig.namespace}/${item.slug}`, pm)}\` does the same.)
2. The CLI writes ${siteConfig.installTarget}/${item.slug}.tsx and installs what it depends on. Read that file before using it — it is plain source, with every prop documented where it is declared.
3. Use it where it fits, following this codebase's conventions. Keep its keyboard paths, live-region announcements and reduced-motion fallback intact.

Reference: ${siteConfig.url}/components/${item.slug}`
}

function useCopied() {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | null>(null)
  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    []
  )
  const flash = React.useCallback(() => {
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }, [])
  return [copied, flash] as const
}

/*
 * The install line, set as large as the type will go. The package manager is
 * a switch beside it, and the component at the end of the command is a
 * control too — the line is the same for all seven, so the line itself is
 * where you pick which.
 */
export function InstallLine({ items }: { items: Item[] }) {
  const [pm, setPm] = React.useState<PackageManager>("pnpm")
  const [slug, setSlug] = React.useState("approval-gate")
  const [copied, flash] = useCopied()
  const [prompted, flashPrompt] = useCopied()

  const item = items.find((entry) => entry.slug === slug) ?? items[0]!
  const command = shadcnAddCommand(`${siteConfig.namespace}/${item.slug}`, pm)
  const prefix = command.slice(0, command.indexOf(siteConfig.namespace))

  async function copy() {
    try {
      await copyToClipboard(command)
      flash()
      toast.success("Install command copied")
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  async function copyPrompt() {
    try {
      await copyToClipboard(agentPrompt(item, pm))
      flashPrompt()
      toast.success(`${item.title} prompt copied`)
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="run-command">
        <span className="text-[#48484c] select-none" aria-hidden="true">
          ${" "}
        </span>
        <span className="text-[#8b8b90]">{prefix}</span>
        <span className="text-[#f5f5f7]">{siteConfig.namespace}/</span>
        <label className="relative inline-flex cursor-pointer items-baseline text-[#f5f5f7]">
          <span className="sr-only">Component</span>
          <span className="underline decoration-white/25 decoration-[0.06em] underline-offset-[0.18em] transition-colors hover:decoration-white/70">
            {item.slug}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="ml-[0.12em] size-[0.55em] translate-y-[-0.05em] self-center text-[#8b8b90]"
          />
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {items.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.title}
              </option>
            ))}
          </select>
        </label>
        <span className="run-caret" aria-hidden="true" />
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="run-seg" role="group" aria-label="Package manager">
          {PACKAGE_MANAGERS.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={pm === entry}
              onClick={() => setPm(entry)}
            >
              {pm === entry ? (
                <motion.span
                  layoutId="run-pm-thumb"
                  className="run-seg-thumb"
                  transition={{ type: "spring", visualDuration: 0.3, bounce: 0.15 }}
                />
              ) : null}
              {entry}
            </button>
          ))}
        </div>
        <button type="button" className="run-btn run-btn--primary" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy command"}
        </button>
        <span className="px-1 text-[14px] text-[#77777c]">or</span>
        <button type="button" className="run-btn run-btn--quiet" onClick={copyPrompt}>
          {prompted ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          {prompted ? "Copied" : "Copy prompt for your agent"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Install command copied" : prompted ? "Prompt copied" : ""}
        </span>
      </div>

      <p className="max-w-[40rem] text-[15px] leading-[1.6] text-[#8b8b90]">
        Writes{" "}
        <code className="font-mono text-[14px] text-[#f5f5f7]">
          {siteConfig.installTarget}/{item.slug}.tsx
        </code>{" "}
        into your project and nothing else — no wrapper package, no runtime to keep in
        step. MIT, WCAG 2.2 AA, and a still fallback for reduced motion.
      </p>
    </div>
  )
}
