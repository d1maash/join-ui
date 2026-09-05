"use client"

import * as React from "react"

const CALM = "(prefers-reduced-motion: reduce)"

/**
 * How far up the viewport a band's top edge has to climb before it is shown,
 * as a share of the viewport's height measured from its bottom.
 *
 * Zero would start the entrance the instant the first pixel crossed the fold,
 * so the reader would watch the whole movement from its hidden frame; a third
 * would leave a band on a laptop screen blank for a long scroll. An eighth is
 * enough that the movement is under way by the time the eye gets there, and
 * no more.
 */
const LEAD = 0.12

/** The elements a band is allowed to be. All of them take a div's attributes. */
type RevealTag = "div" | "section" | "nav" | "article" | "header" | "ul" | "ol"

export interface RevealProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: RevealTag
  /**
   * Animate the `.reveal-item` descendants in sequence, each at its own
   * `--reveal-i`, instead of the band as one piece.
   */
  stagger?: boolean
}

/**
 * A band that arrives when it is scrolled to.
 *
 * The movement itself lives in the stylesheet, under "Arrival" — this
 * component's whole job is to decide *when*, and it does that by writing one
 * attribute onto its own element: `data-reveal="armed"` while the band is
 * still below the fold, `"in"` once it has been reached. React never renders
 * the attribute, so the server sends the band exactly as it will end up, a
 * page without JavaScript shows it, and hydration has nothing to disagree
 * about.
 *
 * Anything already on screen when the effect runs is left alone. That covers
 * the band straddling the fold on first paint, which must not blink out and
 * back; a load with the scroll position restored, where the reader is
 * already halfway down; and a hash link straight into a section. In every one
 * of those cases the content painted before this code ran, and hiding painted
 * content to re-show it is the one thing an entrance must never do.
 *
 * The check runs in a layout effect so that on a client-side navigation — the
 * only time the element is inserted and painted by React rather than by the
 * HTML parser — the band is armed before its first frame.
 */
export function Reveal({ as = "div", stagger = false, ...props }: RevealProps) {
  const ref = React.useRef<HTMLElement>(null)

  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === "undefined") return

    /*
     * Skip the work, rather than doing it fast. The stylesheet already applies
     * none of this under the preference; not observing is what keeps the
     * promise on the script side too.
     */
    if (window.matchMedia(CALM).matches) return

    if (node.getBoundingClientRect().top < window.innerHeight) return

    node.dataset.reveal = "armed"

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        node.dataset.reveal = "in"
        observer.disconnect()
      },
      { rootMargin: `0px 0px -${LEAD * 100}% 0px` }
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      delete node.dataset.reveal
    }
  }, [])

  return React.createElement(as, {
    ref,
    "data-reveal-stagger": stagger ? "" : undefined,
    ...props,
  })
}
