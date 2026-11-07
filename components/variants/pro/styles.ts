import { cn } from "@/lib/utils"

/*
 * Class recipes shared by server and client components. They live outside any
 * "use client" file on purpose: a function exported from one reaches a server
 * component as a client reference, not as a function it can call.
 */

export type PillTone = "primary" | "secondary" | "ghost"

export const pillClass = (tone: PillTone, size: "sm" | "md" | "lg" = "md") =>
  cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-normal whitespace-nowrap",
    "transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.97]",
    "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2997ff]",
    size === "sm" && "h-8 px-4 text-[14px] tracking-[-0.01em]",
    size === "md" && "h-11 px-[22px] text-[17px] tracking-[-0.022em]",
    size === "lg" && "h-[52px] px-7 text-[17px] tracking-[-0.022em]",
    tone === "primary" && "bg-[#0071e3] text-white hover:bg-[#0077ed]",
    tone === "secondary" && "bg-white/[0.1] text-[#f5f5f7] hover:bg-white/[0.16]",
    tone === "ghost" &&
      "text-[#2997ff] shadow-[inset_0_0_0_1px_#2997ff] hover:bg-[#2997ff] hover:text-white"
  )

/** The blue "Learn more ›" text link. */
export const textLinkClass = cn(
  "group/link inline-flex items-center gap-0.5 rounded-sm tracking-[-0.022em] text-[#2997ff]",
  "decoration-1 underline-offset-[0.2em] hover:underline",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
)

/** Section headline sizes, tuned for Inter's optical axis. */
export const type = {
  hero: "text-[clamp(3rem,8.4vw,7.5rem)] leading-[0.98] font-semibold tracking-[-0.048em]",
  display:
    "text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-semibold tracking-[-0.042em] text-balance",
  headline:
    "text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance",
  title:
    "text-[clamp(1.625rem,2.6vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.03em]",
  eyebrow:
    "text-[clamp(1.0625rem,1.6vw,1.3125rem)] leading-[1.2] font-semibold tracking-[-0.02em]",
  intro:
    "text-[clamp(1.1875rem,1.9vw,1.5rem)] leading-[1.38] font-semibold tracking-[-0.025em] text-pretty",
  body: "text-[17px] leading-[1.47] tracking-[-0.022em]",
} as const
