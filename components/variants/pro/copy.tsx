"use client"

import * as React from "react"
import { Check, Copy, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

import { pillClass, type PillTone } from "./styles"

/*
 * Copy, as a pill. Three faces: the blue primary (one per screen), the grey
 * secondary, and a round icon button for the corner of a code panel.
 */
function useCopy(timeoutMs = 1800) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = React.useCallback(
    async (value: string, message: string) => {
      try {
        await copyToClipboard(value)
        setCopied(true)
        toast.success(message)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), timeoutMs)
      } catch {
        toast.error("Could not copy to the clipboard.")
      }
    },
    [timeoutMs]
  )

  return { copied, copy }
}

export function CopyPill({
  value,
  label,
  copiedLabel = "Copied",
  toastMessage = "Copied to the clipboard",
  tone = "secondary",
  size = "md",
  icon = true,
  className,
}: {
  value: string
  label: string
  copiedLabel?: string
  toastMessage?: string
  tone?: PillTone
  size?: "sm" | "md" | "lg"
  icon?: boolean
  className?: string
}) {
  const { copied, copy } = useCopy()

  return (
    <button
      type="button"
      onClick={() => copy(value, toastMessage)}
      className={cn(pillClass(tone, size), className)}
    >
      {icon ? (
        copied ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )
      ) : null}
      <span>{copied ? copiedLabel : label}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  )
}

/** A round copy button for the corner of a code panel or a command. */
export function CopyIcon({
  value,
  label = "Copy",
  toastMessage = "Copied to the clipboard",
  className,
}: {
  value: string
  label?: string
  toastMessage?: string
  className?: string
}) {
  const { copied, copy } = useCopy()

  return (
    <button
      type="button"
      onClick={() => copy(value, toastMessage)}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#a1a1a6]",
        "transition-[background-color,color,transform] duration-200 hover:bg-white/[0.1] hover:text-white active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2997ff]",
        className
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-[#30d158]" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  )
}

/*
 * The prompt for a component is the full brief plus its source — tens of
 * kilobytes — so a page that offers it from three places hands it to the
 * client once, through context, rather than once per button.
 */
const PromptContext = React.createContext<{ prompt: string; name: string } | null>(null)

export function PromptProvider({
  prompt,
  name,
  children,
}: {
  prompt: string
  name: string
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ prompt, name }), [prompt, name])
  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
}

export function CopyPromptPill({
  tone = "primary",
  size = "md",
  label = "Copy prompt",
  className,
}: {
  tone?: PillTone
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}) {
  const context = React.useContext(PromptContext)
  const { copied, copy } = useCopy(2000)
  if (!context) return null

  return (
    <button
      type="button"
      onClick={() => copy(context.prompt, `${context.name} prompt copied`)}
      className={cn(pillClass(tone, size), className)}
    >
      {copied ? (
        <Check aria-hidden="true" className={size === "sm" ? "size-3.5" : "size-4"} />
      ) : (
        <Sparkles aria-hidden="true" className={size === "sm" ? "size-3.5" : "size-4"} />
      )}
      <span>{copied ? "Copied" : label}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Prompt copied" : ""}
      </span>
    </button>
  )
}
