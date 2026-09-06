"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { PromptIcon } from "@/components/site/icons"
import { Button, type ButtonProps } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"

/**
 * Copies the generated agent brief for a component.
 *
 * Distinct from `CopyButton` only in wording and icon — the prompt is the one
 * copy action worth naming explicitly on the page.
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
      {copied ? <Check aria-hidden="true" /> : <PromptIcon aria-hidden="true" />}
      {copied ? "Prompt copied" : "Copy prompt"}
    </Button>
  )
}
