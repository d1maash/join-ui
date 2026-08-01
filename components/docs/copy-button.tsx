"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button, type ButtonProps } from "@/components/ui/button"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

export interface CopyButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  /** Text placed on the clipboard. */
  value: string
  /** Accessible name and tooltip label while idle. */
  label?: string
  /** Announced and shown after a successful copy. */
  copiedLabel?: string
  /** Toast body. Pass `null` to copy silently. */
  toastMessage?: string | null
  /** Render the label next to the icon instead of icon-only. */
  showLabel?: boolean
}

const RESET_DELAY = 2000

/**
 * Copy control with a real success state.
 *
 * The icon swap is backed by a polite live region so the confirmation reaches
 * screen readers too, and clipboard failures surface as an error toast rather
 * than a silent no-op.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastMessage = "Copied to clipboard",
  showLabel = false,
  variant = "ghost",
  size = showLabel ? "sm" : "icon-sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await copyToClipboard(value)
      setCopied(true)
      if (toastMessage) toast.success(toastMessage)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), RESET_DELAY)
    } catch {
      toast.error("Couldn't access the clipboard", {
        description: "Select the text and copy it manually.",
      })
    }
  }

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={copied ? copiedLabel : label}
      onClick={handleCopy}
      className={cn(copied && "text-primary", className)}
      {...props}
    >
      {copied ? (
        <Check
          aria-hidden="true"
          className="animate-[scale-in_var(--duration-fast)_var(--ease-spring)]"
        />
      ) : (
        <Copy aria-hidden="true" />
      )}
      {showLabel ? <span>{copied ? copiedLabel : label}</span> : null}
      <span aria-live="polite" className="sr-only">
        {copied ? `${copiedLabel} to clipboard` : ""}
      </span>
    </Button>
  )

  if (showLabel) return button

  return <SimpleTooltip label={copied ? copiedLabel : label}>{button}</SimpleTooltip>
}
