import { BookOpen, ChevronRight, Home, LayoutGrid, Search, Sparkles } from "lucide-react"

import { LogoMark } from "@/components/site/logo"
import { StatusPill } from "@/components/variants/gallery/card"
import { LazyThumb } from "@/components/variants/gallery/lazy-thumb"
import { realSlug } from "@/components/variants/gallery/links"
import { cn } from "@/lib/utils"

import type { GalleryItem, GalleryNav } from "@/components/variants/gallery/data"

/*
 * The library, framed. Not a screenshot: the rail is the real category list
 * with real counts, the chips are the real categories, and every tile is the
 * live component. It is scenery — inert and hidden from assistive tech, since
 * the same things are one click away for real — so it carries no links.
 */
export function HeroPreview({ nav, items }: { nav: GalleryNav; items: GalleryItem[] }) {
  const shown = items.slice(0, 6)

  return (
    <div className="g-bezel">
      <div
        inert
        aria-hidden="true"
        className="g-bezel-window grid h-[25rem] select-none sm:h-[34rem] md:grid-cols-[13.5rem_minmax(0,1fr)] lg:h-[38rem]"
      >
        <div className="hidden flex-col gap-4 border-r border-[var(--g-line)] p-3.5 md:flex">
          <div className="flex items-center gap-2 px-1">
            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--g-ink)] text-[var(--g-bg)]">
              <LogoMark className="size-3.5" />
            </span>
            <span className="text-[0.8125rem] font-semibold">Join UI</span>
          </div>
          <div className="flex h-8 items-center gap-2 rounded-lg border border-[var(--g-line)] bg-[var(--g-panel)] px-2.5 text-[0.75rem] text-[var(--g-ink-4)]">
            <Search className="size-3" />
            <span className="flex-1">Search library</span>
            <span className="g-kbd h-4 text-[0.625rem]">⌘K</span>
          </div>
          <ul className="flex flex-col gap-px text-[0.75rem]">
            {[
              { label: "Home", icon: Home },
              { label: "Components", icon: LayoutGrid, count: nav.total, active: true },
              { label: "New", icon: Sparkles, count: nav.newCount },
              { label: "Docs", icon: BookOpen },
            ].map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2",
                  item.active ? "bg-[var(--g-panel-3)] text-[var(--g-ink)]" : "text-[var(--g-ink-3)]"
                )}
              >
                <item.icon
                  className={cn("size-3.5", item.active ? "text-[var(--g-accent-ink)]" : "text-[var(--g-ink-4)]")}
                />
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined ? (
                  <span className="g-num text-[0.6875rem] text-[var(--g-ink-4)]">{item.count}</span>
                ) : null}
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-1 px-2 text-[0.625rem] font-medium text-[var(--g-ink-4)]">Categories</p>
            <ul className="flex flex-col gap-px text-[0.75rem]">
              {nav.categories.slice(0, 9).map((category, index) => (
                <li key={category.name}>
                  <div className="flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[var(--g-ink-2)]">
                    <ChevronRight
                      className={cn("size-3 text-[var(--g-ink-4)]", index === 0 && "rotate-90")}
                    />
                    <span className="flex-1 truncate">{category.name}</span>
                    <span className="g-num text-[0.6875rem] text-[var(--g-ink-4)]">{category.count}</span>
                  </div>
                  {index === 0 ? (
                    <ul className="mb-1 ml-3.5 border-l border-[var(--g-line)] pl-2">
                      {category.items.slice(0, 4).map((item) => (
                        <li
                          key={item.slug}
                          className="flex h-6 items-center gap-2 px-1.5 text-[0.71875rem] text-[var(--g-ink-3)]"
                        >
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge ? (
                            <span
                              className={cn(
                                "text-[0.5625rem] font-medium",
                                item.badge === "New" ? "text-[var(--g-accent-ink)]" : "text-[var(--g-ink-4)]"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="g-fade-bottom flex min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-[var(--g-ink)] sm:text-[1.25rem]">
                Components
              </p>
              <p className="text-[0.75rem] text-[var(--g-ink-3)]">
                {nav.total} live components in {nav.categories.length} categories
              </p>
            </div>
            <div className="hidden h-7 items-center rounded-md border border-[var(--g-line)] bg-[var(--g-panel)] p-0.5 text-[0.6875rem] sm:flex">
              <span className="rounded bg-[var(--g-panel-3)] px-2 py-1 text-[var(--g-ink)]">Newest</span>
              <span className="px-2 py-1 text-[var(--g-ink-3)]">A–Z</span>
              <span className="px-2 py-1 text-[var(--g-ink-3)]">Updated</span>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-hidden">
            <span className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-[var(--g-ink)] px-2.5 text-[0.6875rem] font-medium text-[var(--g-bg)]">
              All <span className="opacity-55">{nav.total}</span>
            </span>
            {nav.categories.map((category) => (
              <span
                key={category.name}
                className="flex h-6 shrink-0 items-center gap-1 rounded-full border border-[var(--g-line-2)] px-2.5 text-[0.6875rem] text-[var(--g-ink-2)]"
              >
                {category.name} <span className="text-[var(--g-ink-4)]">{category.count}</span>
              </span>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 lg:grid-cols-3">
            {shown.map((item) => (
              <li key={item.slug} className="flex min-w-0 flex-col gap-2">
                <div className="g-card-thumb aspect-[4/3] rounded-[0.7rem]">
                  <LazyThumb slug={realSlug(item.slug)} eager />
                </div>
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[0.75rem] font-medium text-[var(--g-ink)]">
                      {item.title}
                    </span>
                    <span className="block truncate text-[0.6875rem] text-[var(--g-ink-4)]">
                      {item.category}
                    </span>
                  </span>
                  <StatusPill item={item} className="h-4 px-1.5 text-[0.5625rem]" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
