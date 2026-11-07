"use client"

import * as React from "react"

import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import type { ButtonProps } from "@/components/ui/button"

/*
 * A component's prompt carries its full source, so it is tens of kilobytes.
 * It crosses to the client once, through this provider, and every Copy prompt
 * button on the page reads it from here.
 */
const PromptContext = React.createContext<{ prompt: string; title: string } | null>(null)

export function PromptProvider({
  prompt,
  title,
  children,
}: {
  prompt: string
  title: string
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ prompt, title }), [prompt, title])
  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
}

export function PagePromptButton({ variant, size }: Pick<ButtonProps, "variant" | "size">) {
  const context = React.useContext(PromptContext)
  if (!context) return null
  return <CopyPromptButton prompt={context.prompt} componentName={context.title} variant={variant} size={size} />
}
