import type * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import type { KeyboardInteraction, PropGroup } from "@/types/registry"

import { type } from "./styles"

/*
 * Pieces of the component page that read as apple.com's tech specs: a label
 * column on the left, the values on the right, hairlines between rows.
 */

export function ProSection({
  id,
  title,
  lead,
  children,
  className,
}: {
  id: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-[72px] border-t border-white/[0.12] pt-14 pb-20 sm:pt-20 sm:pb-24", className)}
    >
      <h2 id={`${id}-title`} className={cn(type.headline, "text-[#f5f5f7]")}>
        {title}
      </h2>
      {lead ? (
        <p className={cn(type.intro, "mt-4 max-w-[40rem] font-semibold text-[#86868b]")}>{lead}</p>
      ) : null}
      <div className="mt-10 sm:mt-14">{children}</div>
    </section>
  )
}

export function SpecRow({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2 border-b border-white/[0.12] py-6 first:pt-0 last:border-b-0 sm:grid-cols-12 sm:gap-8">
      <dt className="text-[17px] font-semibold tracking-[-0.022em] text-[#f5f5f7] sm:col-span-4">
        {label}
      </dt>
      <dd className="text-[17px] leading-[1.47] tracking-[-0.022em] text-[#a1a1a6] sm:col-span-8">
        {children}
      </dd>
    </div>
  )
}

export function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-[7px] bg-[#2a2a2d] px-2 font-sans text-[13px] font-medium text-[#f5f5f7] shadow-[inset_0_-1px_0_rgb(0_0_0/0.5),inset_0_0_0_0.5px_rgb(255_255_255/0.14)]">
      {children}
    </kbd>
  )
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[6px] bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.86em] text-[#f5f5f7]">
      {children}
    </code>
  )
}

/** Props as a spec sheet: the prop on the left, what it is on the right. */
export function PropsSheet({ groups }: { groups: PropGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-[17px] text-[#86868b]">This component takes no props.</p>
  }

  return (
    <div className="flex flex-col gap-16">
      {groups.map((group) => (
        <div key={group.name}>
          <div className="mb-6 flex flex-col gap-1.5">
            <h3 className="font-mono text-[19px] font-medium tracking-[-0.01em] text-[#f5f5f7]">
              {group.name}
            </h3>
            {group.description ? (
              <p className="max-w-[44rem] text-[17px] leading-[1.47] text-[#86868b]">
                {group.description}
              </p>
            ) : null}
          </div>
          <dl className="rounded-[24px] bg-[#161617] px-6 py-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] sm:px-8">
            {group.props.map((prop) => (
              <div
                key={prop.name}
                className="grid gap-2 border-b border-white/[0.08] py-5 last:border-b-0 sm:grid-cols-12 sm:gap-8"
              >
                <dt className="flex flex-wrap items-baseline gap-2 sm:col-span-4">
                  <span className="font-mono text-[15px] font-medium text-[#f5f5f7]">
                    {prop.name}
                  </span>
                  {prop.required ? (
                    <span className="text-[12px] font-semibold text-[#ff9f0a]">Required</span>
                  ) : null}
                </dt>
                <dd className="flex flex-col gap-2 sm:col-span-8">
                  <p className="text-[16px] leading-[1.5] tracking-[-0.016em] text-[#d2d2d7]">
                    {prop.description}
                  </p>
                  <p className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12.5px] text-[#86868b]">
                    <span className="break-all">
                      <span className="text-[#86868b]">type </span>
                      <span className="text-[#d2d2d7]">{prop.type}</span>
                    </span>
                    {prop.defaultValue ? (
                      <span className="break-all">
                        <span className="text-[#86868b]">default </span>
                        <span className="text-[#d2d2d7]">{prop.defaultValue}</span>
                      </span>
                    ) : null}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

export function KeyboardSheet({
  entries,
  title,
}: {
  entries: KeyboardInteraction[]
  title: string
}) {
  if (entries.length === 0) {
    return (
      <p className="text-[17px] leading-[1.47] text-[#86868b]">
        {title} renders no interactive controls of its own, so it adds nothing to the tab
        order.
      </p>
    )
  }

  return (
    <dl className="rounded-[24px] bg-[#161617] px-6 py-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] sm:px-8">
      {entries.map((entry) => (
        <div
          key={entry.keys.join("+")}
          className="grid gap-3 border-b border-white/[0.08] py-4 last:border-b-0 sm:grid-cols-12 sm:items-center sm:gap-8"
        >
          <dt className="flex flex-wrap gap-1.5 sm:col-span-4">
            {entry.keys.map((key) => (
              <Keycap key={key}>{key}</Keycap>
            ))}
          </dt>
          <dd className="text-[16px] leading-[1.5] text-[#a1a1a6] sm:col-span-8">
            {entry.description}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** A previous / next tile. */
export function PagerLink({
  href,
  direction,
  title,
  end = false,
}: {
  href: string
  direction: "Previous" | "Next"
  title: string
  end?: boolean
}) {
  return (
    <Link
      href={href}
      rel={direction === "Next" ? "next" : "prev"}
      className={cn(
        "group flex flex-col gap-1 rounded-[22px] bg-[#161617] px-7 py-6 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] transition-colors hover:bg-[#1d1d1f]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
        end && "sm:items-end sm:text-right"
      )}
    >
      <span className="text-[14px] text-[#86868b]">
        {direction === "Previous" ? "‹ Previous" : "Next ›"}
      </span>
      <span className="text-[21px] font-semibold tracking-[-0.025em] text-[#f5f5f7] group-hover:text-[#2997ff]">
        {title}
      </span>
    </Link>
  )
}
