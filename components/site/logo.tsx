import Link from "next/link"

import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The mark: the Join Way monogram — a hooked `J` seated on the bar that carries
 * the `W`, redrawn as vector from the studio's icon so it stays crisp at 16px
 * and inherits its colour from the text beside it.
 *
 * Everything is `currentColor` rather than a brand hue, which is what lets the
 * same file serve the header, the footer and the preview chrome without a
 * second asset. The studio's original layers the `J` over the `W` with a
 * hairline knockout between them; that seam is under half a pixel at the sizes
 * this renders at, so the two shapes are unioned here instead — reproducing it
 * would cost a `<mask>` and a duplicate DOM id for nothing visible.
 *
 * Geometry is traced from `app/icon.png` in the studio repo, normalised to a
 * 24-unit box: stems 3.26 wide, the short middle stem 2.78, everything seated
 * on a baseline at y=18 and hooked with a 2.2 / 1.93 elbow.
 */
/**
 * The two strokes of the mark, exported so the social cards — which are drawn
 * by Satori and cannot render a React component's CSS — can draw the same
 * geometry rather than a second, drifting copy of it.
 */
export const MARK = {
  viewBox: "0 0 24 24",
  /** The `J` hooking left, and the `W`'s right stem turning onto the bar. */
  stems: "M8.55 6v9.8a2.2 2.2 0 0 1-2.2 2.2H3.63M20.4 6v10.07A1.93 1.93 0 0 1 18.47 18H6.6",
  stemsWidth: 3.26,
  /** The `W`'s short middle stem — a touch narrower, as in the original. */
  middle: "M14.5 10.95V18",
  middleWidth: 2.78,
} as const

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      role="img"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <path
        d={MARK.stems}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK.stemsWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={MARK.middle}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK.middleWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
    >
      <LogoMark />
      <span className="text-[0.9375rem] font-semibold">
        {siteConfig.shortName}
        <span className="font-normal text-muted-foreground"> UI</span>
      </span>
    </Link>
  )
}
