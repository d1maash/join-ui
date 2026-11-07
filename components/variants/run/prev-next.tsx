import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface Target {
  title: string
  href: string
}

function Tile({
  direction,
  target,
}: {
  direction: "previous" | "next"
  target: Target
}) {
  const isNext = direction === "next"
  return (
    <Link
      href={target.href}
      className={cn(
        "group flex flex-col gap-2 bg-black p-6 transition-colors hover:bg-[#0b0b0c] focus-visible:outline-offset-[-3px] md:p-8",
        isNext && "sm:items-end sm:text-right"
      )}
    >
      <span className="flex items-center gap-1.5 text-[13px] text-[#77777c]">
        {isNext ? null : (
          <ArrowLeft
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
          />
        )}
        {isNext ? "Next" : "Previous"}
        {isNext ? (
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        ) : null}
      </span>
      <span className="text-[clamp(1.375rem,2.4vw,1.875rem)] leading-[1.15] font-semibold tracking-[-0.02em]">
        {target.title}
      </span>
    </Link>
  )
}

/** Two halves of one plate, joined by a hairline: where you came from, where to go. */
export function PrevNext({
  previous,
  next,
  label,
  className,
}: {
  previous?: Target
  next?: Target
  label: string
  className?: string
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "grid gap-px overflow-hidden rounded-[14px] bg-white/[0.08] sm:grid-cols-2",
        className
      )}
    >
      {previous ? (
        <Tile direction="previous" target={previous} />
      ) : (
        <span className="hidden bg-black sm:block" />
      )}
      {next ? (
        <Tile direction="next" target={next} />
      ) : (
        <span className="hidden bg-black sm:block" />
      )}
    </nav>
  )
}
