import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { ComponentThumb } from "@/components/previews/thumbs/registry"
import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

import { g } from "./ui"

/*
 * One hue per category, for the eyebrow only. Each clears 4.5:1 on the
 * tile's glass at 13px, so the word reads without its colour.
 */
const CATEGORY_INK: Record<string, string> = {
  "Data Display": "text-[#0066cc]",
  Feedback: "text-[#b25000]",
  Marketing: "text-[#7a3cc6]",
  "Text Effects": "text-[#c0185a]",
}

export function categoryInk(category: string): string {
  return CATEGORY_INK[category] ?? "text-[#0066cc]"
}

/**
 * A component as a tile: its live thumbnail in an inset well, then the name,
 * the line, and "Learn more". The whole tile is the link; the thumbnail is
 * inert imagery inside it.
 *
 * The well's radius is the tile's minus its padding, so the two corners stay
 * concentric at every size.
 */
export function ComponentTile({
  item,
  size = "md",
  headingLevel = 3,
  className,
}: {
  item: Pick<CatalogItem, "slug" | "title" | "description" | "category" | "status">
  size?: "lg" | "md"
  headingLevel?: 2 | 3
  className?: string
}) {
  const Heading = `h${headingLevel}` as const

  return (
    <Link
      href={g(`/components/${item.slug}`)}
      className={cn(
        "group g-glass g-flat flex h-full flex-col rounded-[34px] p-2.5",
        "transition-[translate,box-shadow,--g-fill] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:-translate-y-1 hover:[--g-fill:0.72]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
        className
      )}
    >
      <div
        inert
        aria-hidden="true"
        className={cn(
          "g-inset relative overflow-hidden rounded-[24px]",
          size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"
        )}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]">
          <ComponentThumb slug={item.slug} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-5 pb-4 sm:px-5">
        <p className={cn("text-[13px] font-semibold tracking-[-0.01em]", categoryInk(item.category))}>
          {item.category}
          {item.status === "new" ? (
            <span className="font-normal text-[#56565b]"> · New</span>
          ) : null}
        </p>
        <Heading
          className={cn(
            "mt-1 font-semibold text-[#1d1d1f]",
            size === "lg"
              ? "text-[28px] leading-[1.14] tracking-[-0.028em]"
              : "text-[22px] leading-[1.18] tracking-[-0.024em]"
          )}
        >
          {item.title}
        </Heading>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-[1.45] tracking-[-0.012em] text-[#56565b]">
          {item.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-0.5 text-[15px] tracking-[-0.012em] text-[#0066cc] group-hover:underline group-hover:underline-offset-[3px]">
          Learn more
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  )
}
