import Link from "next/link"

import { ComponentThumb } from "@/components/previews/thumbs/registry"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

import { proHref } from "./href"

/*
 * A product tile: the live miniature on a lit, near-black plate above a
 * caption. The whole tile is the link; "Learn more ›" is its visual cue,
 * not a second target.
 */
export function ComponentTile({
  item,
  accent,
  headingLevel = 2,
  className,
}: {
  item: CatalogItem
  accent: string
  headingLevel?: 2 | 3
  className?: string
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  const isNew = item.status === "new"

  return (
    <article
      className={cn(
        "group pro-tile-hairline relative flex flex-col overflow-hidden rounded-[30px] bg-[#161617]",
        "transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.28,0.11,0.32,1)] hover:bg-[#1a1a1b]",
        className
      )}
    >
      <div className="relative m-2 aspect-[16/11] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#1f1f21_0%,#0e0e0f_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, ${accent} 20%, transparent) 0%, transparent 70%)`,
          }}
        />
        <div
          inert
          aria-hidden="true"
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.28,0.11,0.32,1)] group-hover:scale-[1.035]"
        >
          <ComponentThumb slug={item.slug} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-7 pt-5 pb-8">
        <p className="text-[14px] font-semibold tracking-[-0.01em]">
          {isNew ? <span className="mr-2 text-[#ff9f0a]">New</span> : null}
          <span className="text-[#86868b]">{item.category}</span>
        </p>
        <Heading className="mt-1.5 text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] text-[#f5f5f7]">
          <Link
            href={proHref(`/components/${item.slug}`)}
            className="rounded-sm after:absolute after:inset-0 after:rounded-[30px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#2997ff]"
          >
            {item.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-[1.45] tracking-[-0.016em] text-[#86868b]">
          {item.description}
        </p>
        <p
          aria-hidden="true"
          className="mt-5 text-[15px] text-[#2997ff] group-hover:underline"
        >
          Learn more ›
        </p>
      </div>
    </article>
  )
}
