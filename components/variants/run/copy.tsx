"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Copy, Sparkles } from "lucide-react"

import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

/*
 * One copy control for the whole variant. The icon turns into a tick and the
 * word into "Copied" for two seconds; the toast says it out loud for anyone
 * who is not looking at the button.
 */
export function RunCopy({
  value,
  label,
  copiedLabel = "Copied",
  toastMessage,
  variant = "quiet",
  size = "md",
  icon = "copy",
  iconOnly = false,
  className,
}: {
  value: string
  label: string
  copiedLabel?: string
  toastMessage?: string
  variant?: "primary" | "quiet" | "ghost"
  size?: "md" | "sm"
  icon?: "copy" | "prompt"
  iconOnly?: boolean
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    []
  )

  async function onCopy() {
    try {
      await copyToClipboard(value)
      setCopied(true)
      if (toastMessage) toast.success(toastMessage)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  const Icon = copied ? Check : icon === "prompt" ? Sparkles : Copy

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined}
      className={cn(
        "run-btn",
        `run-btn--${variant}`,
        size === "sm" && "run-btn--sm",
        iconOnly && "run-btn--icon",
        className
      )}
    >
      <Icon aria-hidden="true" />
      {iconOnly ? null : <span>{copied ? copiedLabel : label}</span>}
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  )
}
