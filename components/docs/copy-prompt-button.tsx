"use client"

import * as React from "react"
import { Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button, type ButtonProps } from "@/components/ui/button"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

export interface CopyPromptButtonProps extends Omit<
  ButtonProps,
  "children" | "onClick"
> {
  /** The fully assembled prompt. Built server-side from component metadata. */
  prompt: string
  /** Component title, used in the toast and the accessible name. */
  componentName: string
  showLabel?: boolean
}

const RESET_DELAY = 2400

/**
 * The headline action of a component page: puts a complete, agent-ready prompt
 * on the clipboard.
 *
 * The prompt is generated server-side from the component's metadata and real
 * source file, so it can never describe props that do not exist.
 */
export function CopyPromptButton({
  prompt,
  componentName,
  showLabel = true,
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: CopyPromptButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await copyToClipboard(prompt)
      setCopied(true)
      toast.success("Prompt copied", {
        description: `Paste it into Cursor, Claude Code or Codex to add ${componentName}.`,
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), RESET_DELAY)
    } catch {
      toast.error("Couldn't access the clipboard", {
        description: "Open the Prompt tab and copy the text manually.",
      })
    }
  }

  const label = copied ? "Prompt copied" : "Copy prompt"

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={`${label} for ${componentName}`}
      className={cn(
        copied && "border-primary/40 text-primary",
        !copied && "text-foreground",
        className
      )}
      {...props}
    >
      {copied ? (
        <Check
          aria-hidden="true"
          className="animate-[scale-in_var(--duration-fast)_var(--ease-spring)]"
        />
      ) : (
        <Sparkles aria-hidden="true" />
      )}
      {showLabel ? <span>{label}</span> : null}
      <span aria-live="polite" className="sr-only">
        {copied ? `Prompt for ${componentName} copied to clipboard` : ""}
      </span>
    </Button>
  )

  return (
    <SimpleTooltip
      label={
        copied
          ? "Ready to paste into your agent"
          : "Copy an agent-ready prompt with the full source"
      }
    >
      {button}
    </SimpleTooltip>
  )
}
