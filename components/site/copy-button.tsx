"use client"

import * as React from "react"
import { toast } from "sonner"

import { ClipboardCopyMark, CopyFace } from "@/components/site/copy-mark"
import { Button, type ButtonProps } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

export interface CopyButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  value: string
  label?: string
  copiedLabel?: string
  /** When set, a toast confirms the copy for screen-reader and mouse users alike. */
  toastMessage?: string
  showLabel?: boolean
}

/**
 * Copy-to-clipboard control.
 *
 * The confirmation state reverts after two seconds and the timer is cleared on
 * unmount, so a fast navigation cannot leave a pending `setState` behind.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastMessage,
  showLabel = false,
  variant = "ghost",
  size = showLabel ? "sm" : "icon-sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  async function onCopy() {
    try {
      await copyToClipboard(value)
      setCopied(true)
      if (toastMessage) toast.success(toastMessage)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to the clipboard.")
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      aria-label={showLabel ? undefined : copied ? copiedLabel : label}
      className={cn(className)}
      {...props}
    >
      <ClipboardCopyMark copied={copied} />
      {showLabel ? <CopyFace copied={copied} idle={label} done={copiedLabel} /> : null}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  )
}
