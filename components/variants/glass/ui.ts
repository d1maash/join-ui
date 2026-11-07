import { variantHref } from "@/lib/variants"
import { cn } from "@/lib/utils"

/** Every internal link in the variant goes through here. */
export function g(href: string): string {
  return variantHref("glass", href)
}

/** The spring every lens and capsule in the variant moves on. */
export const LENS_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 40,
  mass: 0.9,
} as const

/*
 * Buttons. Pills throughout, the way Apple sets them: 17px regular in the
 * large size, a blue fill for the one action a section is asking for, and
 * glass for everything beside it.
 */
type Tone = "primary" | "glass" | "plain" | "ink"
type Size = "lg" | "md" | "sm" | "icon" | "icon-sm"

const TONES: Record<Tone, string> = {
  primary:
    "bg-[#0071e3] text-white shadow-[0_1px_2px_rgb(0_60_140/0.25),inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-[#0077ed] active:bg-[#006edb]",
  glass:
    "g-glass g-thick text-[#1d1d1f] hover:[--g-fill:0.86] active:[--g-fill:0.94]",
  plain: "text-[#1d1d1f] hover:bg-black/[0.05] active:bg-black/[0.08]",
  ink: "bg-[#1d1d1f] text-white hover:bg-[#2c2c2e]",
}

const SIZES: Record<Size, string> = {
  lg: "h-12 px-6 text-[17px] gap-2 [&_svg]:size-[18px]",
  md: "h-10 px-5 text-[15px] gap-1.5 [&_svg]:size-4",
  sm: "h-8 px-3.5 text-[13px] gap-1.5 [&_svg]:size-3.5",
  icon: "size-10 [&_svg]:size-[18px]",
  "icon-sm": "size-8 [&_svg]:size-4",
}

export function pill(tone: Tone = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-normal tracking-[-0.016em] whitespace-nowrap select-none",
    "transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#0071e3]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:shrink-0",
    TONES[tone],
    SIZES[size],
    className
  )
}

/** "Learn more ›" — Apple's text link. */
export const textLink =
  "inline-flex items-center gap-0.5 rounded-sm text-[#0066cc] hover:underline underline-offset-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
