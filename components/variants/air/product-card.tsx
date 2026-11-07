import Link from "next/link"

import type { CatalogItem } from "@/lib/registry/catalog"
import { cn } from "@/lib/utils"

import { air } from "./href"
import { AirThumb } from "./thumb"

/*
 * The Store card: a tall white card on the grey band, the product in a quiet
 * well at the top, a coloured "New" over the name, one line of copy, and a
 * soft shadow that deepens as the card lifts under the pointer. The whole card
 * is the link.
 */
export function ProductCard({
  item,
  wide = false,
  className,
}: {
  item: CatalogItem
  wide?: boolean
  className?: string
}) {
  const eyebrow =
    item.status === "new" ? "New" : item.updated ? "Updated" : item.category
  const highlighted = item.status === "new" || Boolean(item.updated)
  const facts = [
    item.category,
    item.traits.includes("animated") ? "Animated" : null,
    item.dependencyCount === 0
      ? "No dependencies"
      : `${item.dependencyCount} ${item.dependencyCount === 1 ? "dependency" : "dependencies"}`,
  ].filter(Boolean)

  return (
    <Link
      href={air(`/components/${item.slug}`)}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white p-2 text-left",
        "shadow-[2px_4px_12px_rgb(0_0_0/0.08)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:scale-[1.012] hover:shadow-[2px_6px_24px_rgb(0_0_0/0.14)]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[18px] bg-[#f5f5f7]",
          wide ? "h-[17rem] sm:h-[19rem]" : "h-[15.5rem] sm:h-[17rem]"
        )}
      >
        <AirThumb slug={item.slug} className="absolute inset-0" />
      </div>
      <div className="flex flex-1 flex-col px-5 pt-5 pb-5 sm:px-6">
        <p
          className={cn(
            "text-[12px] font-semibold tracking-[-0.004em]",
            highlighted ? "text-[#b64400]" : "text-[#6e6e73]"
          )}
        >
          {eyebrow}
        </p>
        <h3 className="mt-1 text-[24px] leading-[1.16] font-semibold tracking-[-0.026em] text-[#1d1d1f]">
          {item.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-[15px] leading-[1.4] tracking-[-0.01em] text-[#6e6e73]",
            wide ? "max-w-[46ch]" : "line-clamp-3"
          )}
        >
          {item.description}
        </p>
        <p className="mt-auto pt-5 text-[12px] text-[#6e6e73]">{facts.join(" · ")}</p>
      </div>
    </Link>
  )
}
