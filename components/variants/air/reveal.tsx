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

  // The attribute is written straight to the element rather than through
  // state: React never sets `data-shown`, so it never takes it away again,
  // and releasing an entrance costs no re-render.
  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const show = () => element.setAttribute("data-shown", "")
    if (typeof IntersectionObserver === "undefined") {
      show()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          show()
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return React.createElement(
    Tag,
    {
      ref,
      "data-air-reveal": "",
      className,
      style: delay ? { ...style, ["--air-delay" as string]: `${delay}ms` } : style,
      ...props,
    },
    children
  )
}
