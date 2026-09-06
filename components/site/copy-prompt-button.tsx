"use client"

import * as React from "react"
import { toast } from "sonner"

import { CopyFace, PromptCopyMark } from "@/components/site/copy-mark"
import { Button, type ButtonProps } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"

/**
 * Copies the generated agent brief for a component.
 *
 * One beat: the prompt mark retracts as "Copy prompt" leaves the slot, then
 * the check is drawn as "Copied" rises into the same place. The two faces
 * share a cell so the pill never resizes around the words.
 */
export function CopyPromptButton({
  prompt,
  componentName,
  variant = "secondary",
  size = "sm",
}: {
  prompt: string
  componentName: string
} & Pick<ButtonProps, "variant" | "size">) {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  async function onCopy() {
    try {
      await copyToClipboard(prompt)
      setCopied(true)
      toast.success(`${componentName} prompt copied`)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy the prompt.")
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={onCopy}>
      <PromptCopyMark copied={copied} />
      <CopyFace copied={copied} idle="Copy prompt" done="Copied" />
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </Button>
  )
}
