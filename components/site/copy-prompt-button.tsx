"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import { PromptCopyMark } from "@/components/site/copy-mark"
import { Button, type ButtonProps } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Copies the generated agent brief for a component.
 *
 * The icon does the change of state — the prompt mark retracts, a check is
 * drawn — and the words follow it, fading in the same cell so the pill does
 * not resize around them.
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

  const fade = {
    duration: still ? 0 : 0.18,
    ease: EASE,
    delay: still || !copied ? 0 : 0.08,
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={onCopy}>
      <PromptCopyMark copied={copied} />
      <span className="grid justify-items-start">
        <motion.span
          aria-hidden={copied}
          className="col-start-1 row-start-1"
          initial={false}
          animate={{ opacity: copied ? 0 : 1 }}
          transition={{ duration: still ? 0 : 0.16, ease: EASE }}
        >
          Copy prompt
        </motion.span>
        <motion.span
          aria-hidden={!copied}
          className="col-start-1 row-start-1"
          initial={false}
          animate={{ opacity: copied ? 1 : 0 }}
          transition={fade}
        >
          Prompt copied
        </motion.span>
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied" : ""}
      </span>
    </Button>
  )
}
