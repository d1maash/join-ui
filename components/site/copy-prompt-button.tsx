"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { PromptIcon } from "@/components/site/icons"
import { Button, type ButtonProps } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"

const EASE = [0.22, 1, 0.36, 1] as const
const TRAVEL = 5

/**
 * Copies the generated agent brief for a component.
 *
 * Distinct from `CopyButton` only in wording and icon — the prompt is the one
 * copy action worth naming explicitly on the page. The two faces share one
 * grid cell so the pill never resizes; confirmation rises into place and the
 * idle label leaves upward, the same direction a line of type advances.
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
  const still = useReducedMotion() === true

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

  const swap = {
    duration: still ? 0 : 0.2,
    ease: EASE,
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      className="overflow-hidden"
    >
      <span className="grid justify-items-start">
        <motion.span
          aria-hidden={copied}
          className="col-start-1 row-start-1 inline-flex items-center gap-2"
          initial={false}
          animate={{
            opacity: copied ? 0 : 1,
            y: still ? 0 : copied ? -TRAVEL : 0,
          }}
          transition={swap}
        >
          <PromptIcon aria-hidden="true" />
          Copy prompt
        </motion.span>
        <motion.span
          aria-hidden={!copied}
          className="col-start-1 row-start-1 inline-flex items-center gap-2"
          initial={false}
          animate={{
            opacity: copied ? 1 : 0,
            y: still ? 0 : copied ? 0 : TRAVEL,
          }}
          transition={swap}
        >
          <Check aria-hidden="true" />
          Prompt copied
        </motion.span>
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied" : ""}
      </span>
    </Button>
  )
}
