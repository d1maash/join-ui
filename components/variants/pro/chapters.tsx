"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

import { Scene } from "./scenes"
import { textLinkClass, type } from "./styles"

export interface Chapter {
  slug: string
  title: string
  headline: string
  body: string
  accent: string
  href: string
}

function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}

/*
 * "Take a closer look", as a sticky story. On a wide screen the captions
 * scroll past on the left while one stage holds still on the right, and the
 * component on it changes as each caption reaches the middle of the screen —
 * mounted fresh, so it performs its own entrance every time it arrives. On a
 * phone each caption simply carries its own stage, mounted as it comes near.
 */
export function Chapters({ chapters }: { chapters: Chapter[] }) {
  const desktop = useMediaQuery("(min-width: 1024px)")
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState(0)
  const items = React.useRef<Array<HTMLLIElement | null>>([])

  React.useEffect(() => {
    if (!desktop) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (!Number.isNaN(index)) setActive(index)
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    )
    for (const item of items.current) if (item) observer.observe(item)
    return () => observer.disconnect()
  }, [desktop])

  const current = chapters[active] ?? chapters[0]

  function jumpTo(index: number) {
    items.current[index]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    })
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
      <ol className="flex flex-col gap-24 lg:col-span-5 lg:gap-0">
        {chapters.map((chapter, index) => (
          <li
            key={chapter.slug}
            ref={(node) => {
              items.current[index] = node
            }}
            data-index={index}
            className="flex flex-col gap-10 lg:min-h-[86vh] lg:justify-center lg:py-16"
          >
            <Caption chapter={chapter} index={index} active={!desktop || index === active} />
            <div className="lg:hidden">
              <InlineStage chapter={chapter} />
            </div>
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-7 lg:block">
        <div className="sticky top-[calc(48px+5vh)] h-[min(780px,calc(90vh-48px))]">
          {current ? (
            <section
              aria-label={`Live: ${current.title}`}
              className="pro-stage relative flex size-full flex-col overflow-hidden rounded-[36px]"
            >
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.slug}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
                  style={{
                    opacity: index === active ? 1 : 0,
                    background: `radial-gradient(70% 55% at 50% 0%, color-mix(in oklab, ${chapter.accent} 22%, transparent) 0%, transparent 72%)`,
                  }}
                />
              ))}

              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-10 xl:p-14">
                {desktop ? (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current.slug}
                      className="flex w-full items-center justify-center"
                      initial={{ opacity: 0, scale: 0.965, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.985, y: -8 }}
                      transition={{ duration: reduce ? 0 : 0.45, ease: [0.28, 0.11, 0.32, 1] }}
                    >
                      <Scene slug={current.slug} />
                    </motion.div>
                  </AnimatePresence>
                ) : null}
              </div>

              <nav
                aria-label="Chapters"
                className="relative flex items-center justify-center gap-1 pb-6"
              >
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.slug}
                    type="button"
                    onClick={() => jumpTo(index)}
                    aria-label={chapter.title}
                    aria-current={index === active ? "step" : undefined}
                    className="group flex h-6 cursor-pointer items-center px-1 focus-visible:outline-2 focus-visible:outline-[#2997ff]"
                  >
                    <span
                      className={cn(
                        "block h-2 rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.28,0.11,0.32,1)]",
                        index === active
                          ? "w-6 bg-[#f5f5f7]"
                          : "w-2 bg-white/30 group-hover:bg-white/60"
                      )}
                    />
                  </button>
                ))}
              </nav>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Caption({
  chapter,
  index,
  active,
}: {
  chapter: Chapter
  index: number
  active: boolean
}) {
  return (
    <div
      className={cn(
        "max-w-[30rem] transition-opacity duration-500 lg:pl-6",
        "lg:border-l-2",
        active ? "lg:border-[var(--chapter-accent)]" : "lg:border-white/[0.08]"
      )}
      style={{ "--chapter-accent": chapter.accent } as React.CSSProperties}
    >
      <p className={type.eyebrow} style={{ color: chapter.accent }}>
        <span className="sr-only">{index + 1}. </span>
        {chapter.title}
      </p>
      <h3 className={cn(type.headline, "mt-3 text-[#f5f5f7]")}>{chapter.headline}</h3>
      <p className={cn(type.body, "mt-5 text-[#86868b] lg:text-[19px] lg:leading-[1.42]")}>
        {chapter.body}
      </p>
      <p className="mt-6">
        <Link href={chapter.href} className={cn(textLinkClass, "text-[17px]")}>
          Learn more<span className="sr-only"> about {chapter.title}</span>
          <span aria-hidden="true" className="ml-0.5">
            ›
          </span>
        </Link>
      </p>
    </div>
  )
}

function InlineStage({ chapter }: { chapter: Chapter }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [seen, setSeen] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin: "240px 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="pro-stage relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[28px] px-5 py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 50% at 50% 0%, color-mix(in oklab, ${chapter.accent} 22%, transparent) 0%, transparent 72%)`,
        }}
      />
      <div className="relative flex w-full items-center justify-center">
        {seen ? <Scene slug={chapter.slug} /> : null}
      </div>
    </div>
  )
}
