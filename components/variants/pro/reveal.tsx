"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * A scroll reveal that never hides what the server sent.
 *
 * The element is only marked hidden after hydration, only if it is still
 * below the fold, and never under Reduce Motion — so the page is complete
 * without script, nothing already on screen blinks out and back, and a reader
 * who has asked for stillness gets the final layout straight away.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  y,
  scale,
  className,
  style,
  children,
  ...rest
}: {
  as?: "div" | "section" | "li" | "header" | "p" | "figure" | "article" | "span"
  delay?: number
  y?: number
  scale?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLElement>, "style" | "className" | "children">) {
  const ref = React.useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return

    element.dataset.proReveal = "hidden"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.proReveal = "shown"
        observer.disconnect()
      },
      { rootMargin: "0px 0px -12% 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const vars = {
    ...(delay ? { "--pro-reveal-delay": `${delay}ms` } : null),
    ...(y !== undefined ? { "--pro-reveal-y": `${y}px` } : null),
    ...(scale !== undefined ? { "--pro-reveal-scale": scale } : null),
  } as React.CSSProperties

  return React.createElement(
    Tag,
    {
      ref,
      className: cn(className),
      style: { ...vars, ...style },
      ...rest,
    },
    children
  )
}
