"use client"

import * as React from "react"
import { BotMessageSquare, Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { copyToClipboard } from "@/lib/clipboard"
import { useStoredPreference } from "@/lib/hooks"
import { PACKAGE_MANAGERS, shadcnAddCommand, siteConfig, type PackageManager } from "@/lib/site"
import { variantBase } from "@/lib/variants"
import { cn } from "@/lib/utils"

export function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/** The package manager picked anywhere on the site, shared with every switch. */
export function usePackageManager() {
  return useStoredPreference<PackageManager>("joinui-package-manager", "pnpm", isPackageManager)
}

function useCopied() {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  const flash = React.useCallback(() => {
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }, [])
  return [copied, flash] as const
}

type Size = "sm" | "md"

/** A labelled copy control. */
export function IxCopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastMessage,
  size = "md",
  icon,
  hideLabel = false,
  className,
}: {
  value: string
  label?: string
  copiedLabel?: string
  toastMessage?: string
  size?: Size
  icon?: React.ReactNode
  hideLabel?: boolean
  className?: string
}) {
  const [copied, flash] = useCopied()

  async function onCopy() {
    try {
      await copyToClipboard(value)
      flash()
      if (toastMessage) toast.success(toastMessage)
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      data-copied={copied ? "" : undefined}
      aria-label={hideLabel ? (copied ? copiedLabel : label) : undefined}
      className={cn(
        hideLabel ? "ix-icon-btn" : "ix-btn",
        !hideLabel && size === "sm" && "ix-btn-sm",
        copied && "ix-accent",
        className
      )}
    >
      {copied ? <Check aria-hidden="true" /> : (icon ?? <Copy aria-hidden="true" />)}
      {hideLabel ? null : <span>{copied ? copiedLabel : label}</span>}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  )
}

/** Copies the install command for a component, in the reader's package manager. */
export function IxInstallCopy({
  slug,
  size = "sm",
  label = "Copy",
  className,
}: {
  slug: string
  size?: Size
  label?: string
  className?: string
}) {
  const [manager] = usePackageManager()
  return (
    <IxCopyButton
      value={shadcnAddCommand(`${siteConfig.namespace}/${slug}`, manager)}
      label={label}
      copiedLabel="Copied"
      toastMessage="Install command copied"
      size={size}
      className={className}
    />
  )
}

/*
 * The agent prompt for a cell.
 *
 * A prompt carries the component's full source, so a few hundred of them
 * inlined into a catalog page would be megabytes nobody asked for. Each one is
 * instead a static text file generated at build time
 * (`/v/index/prompt/<slug>`), fetched the moment a pointer or focus reaches
 * the button and copied on click. Where the browser insists the write happen
 * inside the click itself, the fetch is handed to the clipboard as a promise.
 */
const prompts = new Map<string, Promise<string>>()

function loadPrompt(slug: string): Promise<string> {
  let pending = prompts.get(slug)
  if (!pending) {
    pending = fetch(`${variantBase("index")}/prompt/${slug}`).then((response) => {
      if (!response.ok) throw new Error(`Prompt for ${slug} is missing`)
      return response.text()
    })
    pending.catch(() => prompts.delete(slug))
    prompts.set(slug, pending)
  }
  return pending
}

export function IxPromptButton({
  slug,
  title,
  size = "sm",
  label = "Prompt",
  className,
}: {
  slug: string
  title: string
  size?: Size
  label?: string
  className?: string
}) {
  const [copied, flash] = useCopied()
  const warm = () => void loadPrompt(slug).catch(() => undefined)

  async function onCopy() {
    try {
      const pending = loadPrompt(slug)
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": pending.then((text) => new Blob([text], { type: "text/plain" })),
            }),
          ])
        } catch {
          await copyToClipboard(await pending)
        }
      } else {
        await copyToClipboard(await pending)
      }
      flash()
      toast.success(`${title} prompt copied`, {
        description: "Paste it into Claude Code, Cursor or Codex.",
      })
    } catch {
      toast.error("Could not copy the prompt.")
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      onPointerEnter={warm}
      onFocus={warm}
      data-copied={copied ? "" : undefined}
      className={cn("ix-btn", size === "sm" && "ix-btn-sm", className)}
      aria-label={`Copy the agent prompt for ${title}`}
    >
      {copied ? <Check aria-hidden="true" /> : <BotMessageSquare aria-hidden="true" />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  )
}

/** The agent prompt when the page already has it — the component page. */
export function IxCopyPrompt({
  prompt,
  title,
  primary = false,
  className,
}: {
  prompt: string
  title: string
  primary?: boolean
  className?: string
}) {
  const [copied, flash] = useCopied()

  async function onCopy() {
    try {
      await copyToClipboard(prompt)
      flash()
      toast.success(`${title} prompt copied`, {
        description: "Paste it into Claude Code, Cursor or Codex.",
      })
    } catch {
      toast.error("Could not copy the prompt.")
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      data-copied={copied && !primary ? "" : undefined}
      className={cn("ix-btn", primary && "ix-btn-primary", className)}
    >
      {copied ? <Check aria-hidden="true" /> : <BotMessageSquare aria-hidden="true" />}
      <span>{copied ? "Copied" : "Copy prompt"}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied" : ""}
      </span>
    </button>
  )
}
