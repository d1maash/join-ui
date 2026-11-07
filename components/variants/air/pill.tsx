import type * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/*
 * Apple's two buttons and its one link.
 *
 * The filled pill is the single thing to do next — one per band, never two.
 * The outlined pill is its companion. Everything else is a blue text link
 * that ends in a chevron. Sizes follow apple.com: 17px in a hero, 14px in a
 * tile, 12px in the local nav.
 */
export type PillVariant = "primary" | "secondary" | "neutral" | "onDark"
export type PillSize = "lg" | "md" | "sm"

const VARIANT: Record<PillVariant, string> = {
  primary: "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#006edb]",
  secondary:
    "text-[#0066cc] shadow-[inset_0_0_0_1px_#0071e3] hover:bg-[#0071e3] hover:text-white",
  neutral: "bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#dcdce1]",
  onDark:
    "text-[#2997ff] shadow-[inset_0_0_0_1px_#2997ff] hover:bg-[#2997ff] hover:text-black",
}

const SIZE: Record<PillSize, string> = {
  lg: "h-12 min-w-28 px-6 text-[17px] [&_svg]:size-[18px]",
  md: "h-10 min-w-24 px-5 text-[15px] [&_svg]:size-4",
  sm: "h-7 px-3 text-[12px] [&_svg]:size-3.5",
}

export function pillClass(variant: PillVariant = "primary", size: PillSize = "md") {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full font-normal tracking-[-0.01em] whitespace-nowrap select-none",
    "transition-[background-color,color,box-shadow] duration-200 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
    "[&_svg]:shrink-0",
    VARIANT[variant],
    SIZE[size]
  )
}

export function PillLink({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: {
  href: string
  variant?: PillVariant
  size?: PillSize
} & Omit<React.ComponentPropsWithoutRef<"a">, "href">) {
  return (
    <Link href={href} className={cn(pillClass(variant, size), className)} {...props}>
      {children}
    </Link>
  )
}

/** "Learn more ›" — the blue text link every Apple band ends on. */
export function MoreLink({
  href,
  children,
  external = false,
  tone = "light",
  className,
  ...props
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  tone?: "light" | "dark"
} & Omit<React.ComponentPropsWithoutRef<"a">, "href">) {
  const style = cn(
    "group inline-flex items-center gap-0.5 rounded-sm tracking-[-0.012em]",
    "underline-offset-[0.18em] hover:underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
    tone === "dark" ? "text-[#2997ff]" : "text-[#0066cc]",
    className
  )
  const body = (
    <>
      <span>{children}</span>
      <ChevronRight
        aria-hidden="true"
        strokeWidth={2.4}
        className="size-[0.8em] translate-y-[0.04em] transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={style} {...props}>
        {body}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }

  return (
    <Link href={href} className={style} {...props}>
      {body}
    </Link>
  )
}
