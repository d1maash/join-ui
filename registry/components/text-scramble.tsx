"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const DEFAULT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>-_/\\[]{}=+*^?#%$&"

/** `useLayoutEffect` that degrades to `useEffect` during SSR. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

export interface TextScrambleProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** The final, readable string. Always exposed to assistive technology. */
  text: string
  /** Pool the scrambler draws noise characters from. */
  characters?: string
  /** Frames spent per revealed character. Higher is slower. */
  speed?: number
  /** Milliseconds to wait before starting. */
  delay?: number
  trigger?: "mount" | "view" | "hover"
  /** Element to render. Defaults to `span`. */
  as?: React.ElementType
}

/**
 * Decodes text from noise into its final form.
 *
 * The animation writes to `textContent` through a ref instead of React state,
 * so a 40-character headline costs zero re-renders. The readable string is
 * rendered on the server and exposed via `aria-label`, with the animating node
 * marked `aria-hidden` — screen readers and search engines only ever see the
 * final text, and `prefers-reduced-motion` skips the effect entirely.
 */
export function TextScramble({
  text,
  characters = DEFAULT_CHARACTERS,
  speed = 2,
  delay = 0,
  trigger = "mount",
  as,
  className,
  onPointerEnter,
  ...props
}: TextScrambleProps) {
  const Tag = (as ?? "span") as React.ElementType
  const nodeRef = React.useRef<HTMLSpanElement>(null)
  const rootRef = React.useRef<HTMLElement>(null)
  const [runToken, setRunToken] = React.useState(trigger === "mount" ? 1 : 0)

  // `view` waits for the element to reach the viewport before the first run.
  React.useEffect(() => {
    if (trigger !== "view") return
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setRunToken((token) => token || 1)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRunToken((token) => token || 1)
          observer.disconnect()
        }
      },
      { rootMargin: "-10% 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger])

  useIsomorphicLayoutEffect(() => {
    const node = nodeRef.current
    if (!node || runToken === 0) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReduced || characters.length === 0) {
      node.textContent = text
      return
    }

    let frame = 0
    let raf = 0
    let timer = 0
    const length = text.length

    const step = () => {
      frame += 1
      const revealed = Math.floor(frame / Math.max(1, speed))
      let output = ""
      for (let index = 0; index < length; index += 1) {
        const char = text[index] ?? ""
        if (index < revealed || char === " ") {
          output += char
        } else {
          const pick = Math.floor(Math.random() * characters.length)
          output += characters[pick] ?? char
        }
      }
      node.textContent = output
      if (revealed < length) {
        raf = requestAnimationFrame(step)
      } else {
        node.textContent = text
      }
    }

    node.textContent = ""
    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(step)
    }, delay)

    return () => {
      window.clearTimeout(timer)
      if (raf !== 0) cancelAnimationFrame(raf)
    }
  }, [text, characters, speed, delay, runToken])

  return (
    <Tag
      ref={rootRef}
      aria-label={text}
      onPointerEnter={(event: React.PointerEvent<HTMLElement>) => {
        onPointerEnter?.(event as React.PointerEvent<HTMLSpanElement>)
        if (trigger === "hover") setRunToken((token) => token + 1)
      }}
      className={cn("inline-block tabular-nums", className)}
      {...props}
    >
      {/* Server-rendered as readable text, then driven imperatively. */}
      <span ref={nodeRef} aria-hidden="true">
        {text}
      </span>
    </Tag>
  )
}
