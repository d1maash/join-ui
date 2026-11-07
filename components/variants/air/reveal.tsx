"use client"

import * as React from "react"

/*
 * The scroll entrance, played once.
 *
 * The hidden state is pure CSS (`[data-air-reveal]:not([data-shown])` in
 * air.css), scoped to `prefers-reduced-motion: no-preference`, so a reader who
 * has turned motion down never has anything held back. This component only
 * releases it: the first time the element meets the viewport it gets
 * `data-shown`, and the stylesheet's transition does the rest. A layout
 * without JavaScript is covered by the `<noscript>` rule in the variant layout.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
  ...props
}: {
  as?: "div" | "section" | "li" | "header" | "article" | "figure"
  /** Milliseconds after the element is reached. */
  delay?: number
} & React.HTMLAttributes<HTMLElement>) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element || shown) return
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [shown])

  return React.createElement(
    Tag,
    {
      ref,
      "data-air-reveal": "",
      "data-shown": shown ? "" : undefined,
      className,
      style: delay ? { ...style, ["--air-delay" as string]: `${delay}ms` } : style,
      ...props,
    },
    children
  )
}
