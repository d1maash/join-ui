import type * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { IxFlag } from "./badge"
import { categorySlug } from "./codes"
import { ixHref, type IxCategory } from "./data"

/** The hatched band between two sections. */
export function IxGutter({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("ix-frame ix-gutter", className)} />
}

/** A section's head row: number, title, a line of description and an action. */
export function IxSectionHead({
  index,
  id,
  title,
  description,
  action,
}: {
  index: string
  id: string
  title: string
  description: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="ix-frame ix-cross ix-rule-b grid grid-cols-1 gap-6 px-5 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:px-8 md:py-11 lg:px-10">
      <div>
        <p className="ix-mono ix-fg-3">{index}</p>
        <h2
          id={id}
          className="mt-3 text-[1.875rem] leading-[1.05] font-semibold tracking-[-0.04em] md:text-[2.5rem]"
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-col justify-end gap-4">
        <p className="ix-fg-2 text-[0.9375rem] leading-relaxed text-pretty">{description}</p>
        {action}
      </div>
    </div>
  )
}

/**
 * The whole library as an index: one column per category, a row per
 * component — code, name, flag. This is the part of the landing page that
 * grows with the registry; at three hundred components it is still one
 * screen of names you can scan.
 */
export function IxIndexColumns({
  categories,
  headingLevel = 3,
}: {
  categories: IxCategory[]
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  return (
    <div className="ix-frame ix-rule-b">
      <div className="ix-cells" data-cols="4">
        {categories.map((category) => (
          <section
            key={category.name}
            id={`index-${categorySlug(category.name)}`}
            aria-labelledby={`index-${categorySlug(category.name)}-title`}
            className="bg-[var(--ix-bg)] px-5 pt-5 pb-6"
          >
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <Heading id={`index-${categorySlug(category.name)}-title`} className="text-[0.9375rem] font-semibold tracking-[-0.015em]">
                <Link
                  href={ixHref(`/components?category=${encodeURIComponent(category.name)}`)}
                  className="hover:underline hover:decoration-[var(--ix-line-3)] hover:underline-offset-4"
                >
                  {category.name}
                </Link>
              </Heading>
              <span className="ix-mono ix-fg-3">
                {category.mark} · {String(category.count).padStart(2, "0")}
              </span>
            </div>
            <ul>
              {category.items.map((item) => (
                <li key={item.id}>
                  <Link href={ixHref(`/components/${item.slug}`)} className="ix-row-link">
                    <span className="ix-row-code">{item.code}</span>
                    <span className="ix-row-title truncate">{item.title}</span>
                    <IxFlag badge={item.badge} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
