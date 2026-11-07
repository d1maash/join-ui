import type * as React from "react"

import { cn } from "@/lib/utils"
import type { ComponentCategory } from "@/types/registry"

/*
 * One generic skeleton per category. The taxonomy is fixed (twelve entries in
 * `types/registry`), so these are drawn once and never per component: a new
 * component lands in an existing category and its card is already drawn.
 * Shapes only, in the theme's own ink at low alpha.
 */

function Bar({ className }: { className?: string }) {
  return <span className={cn("block h-1.5 rounded-full bg-[var(--st-art)]", className)} />
}

function Panel({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-border bg-background shadow-xs", className)}>
      {children}
    </div>
  )
}

const ART: Record<ComponentCategory, () => React.ReactNode> = {
  Buttons: () => (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-16 items-center justify-center rounded-md bg-[var(--st-art-ink)]">
        <span className="h-1.5 w-8 rounded-full bg-background/60" />
      </span>
      <Panel className="flex h-7 w-14 items-center justify-center rounded-md">
        <Bar className="w-7" />
      </Panel>
      <span className="flex h-7 w-10 items-center justify-center rounded-md bg-[var(--st-art)]">
        <span className="h-1.5 w-5 rounded-full bg-[var(--st-art-strong)]" />
      </span>
    </div>
  ),
  Navigation: () => (
    <div className="flex w-44 items-center gap-1 rounded-lg bg-[var(--st-art)] p-1">
      <Panel className="flex h-6 flex-1 items-center justify-center rounded-md">
        <Bar className="w-8 bg-[var(--st-art-strong)]" />
      </Panel>
      <span className="flex h-6 flex-1 items-center justify-center">
        <Bar className="w-7" />
      </span>
      <span className="flex h-6 flex-1 items-center justify-center">
        <Bar className="w-6" />
      </span>
    </div>
  ),
  Cards: () => (
    <Panel className="w-40 overflow-hidden">
      <div className="h-12 bg-[var(--st-art)]" />
      <div className="flex items-center gap-2 p-2.5">
        <span className="size-5 shrink-0 rounded-full bg-[var(--st-art-strong)]" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Bar className="w-3/4 bg-[var(--st-art-strong)]" />
          <Bar className="w-1/2" />
        </div>
      </div>
    </Panel>
  ),
  Forms: () => (
    <div className="flex w-40 flex-col gap-2">
      <Bar className="w-12" />
      <Panel className="flex h-7 items-center px-2.5">
        <Bar className="w-16" />
      </Panel>
      <div className="flex items-center gap-2">
        <span className="flex size-3.5 items-center justify-center rounded-[4px] bg-[var(--st-art-ink)]">
          <span className="h-1 w-1.5 rounded-full bg-background/70" />
        </span>
        <Bar className="w-20" />
      </div>
    </div>
  ),
  "Data Display": () => (
    <div className="relative flex w-40 flex-col gap-3.5 pl-4">
      <span className="absolute top-1 bottom-1 left-[5px] w-px bg-[var(--st-art-strong)]" />
      {["w-24", "w-28", "w-16"].map((width, index) => (
        <div key={width} className="relative flex flex-col gap-1">
          <span
            className={cn(
              "absolute top-0 -left-4 size-[11px] rounded-full border-2 border-background",
              index === 1 ? "bg-[var(--st-art-ink)]" : "bg-[var(--st-art-strong)]"
            )}
          />
          <Bar className={cn(width, "bg-[var(--st-art-strong)]")} />
          <Bar className="w-12" />
        </div>
      ))}
    </div>
  ),
  Feedback: () => (
    <div className="flex w-44 flex-col gap-2">
      <Panel className="flex items-center gap-2.5 p-2.5">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--st-art-ink)]">
          <span className="h-1 w-2 rounded-full bg-background/70" />
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <Bar className="w-3/4 bg-[var(--st-art-strong)]" />
          <Bar className="w-1/2" />
        </div>
      </Panel>
      <span className="block h-1 overflow-hidden rounded-full bg-[var(--st-art)]">
        <span className="block h-full w-3/5 rounded-full bg-[var(--st-art-ink)]" />
      </span>
    </div>
  ),
  Overlays: () => (
    <div className="relative flex h-24 w-44 items-center justify-center rounded-lg bg-[var(--st-art)]">
      <Panel className="flex w-28 flex-col gap-1.5 p-2.5 shadow-md">
        <Bar className="w-3/4 bg-[var(--st-art-strong)]" />
        <Bar className="w-full" />
        <div className="mt-1 flex justify-end gap-1">
          <span className="h-3.5 w-7 rounded-[4px] bg-[var(--st-art)]" />
          <span className="h-3.5 w-7 rounded-[4px] bg-[var(--st-art-ink)]" />
        </div>
      </Panel>
    </div>
  ),
  "Text Effects": () => (
    <div className="flex flex-col items-center gap-2">
      <span className="relative text-[44px] leading-none font-semibold tracking-[-0.04em] text-[var(--st-art-ink)]">
        <span aria-hidden="true" className="absolute top-1 left-1 text-[var(--st-art-strong)]">
          Aa
        </span>
        <span className="relative">Aa</span>
      </span>
      <Bar className="w-20" />
    </div>
  ),
  Backgrounds: () => (
    <div className="st-dots relative h-24 w-44 overflow-hidden rounded-lg border border-border">
      <span className="absolute -top-6 -right-6 size-20 rounded-full bg-[var(--st-art-strong)] blur-xl" />
      <span className="absolute -bottom-8 -left-4 size-20 rounded-full bg-[var(--st-art)] blur-lg" />
    </div>
  ),
  Layout: () => (
    <div className="grid h-24 w-44 grid-cols-3 grid-rows-2 gap-1.5">
      <Panel className="col-span-2 row-span-2" />
      <Panel />
      <span className="rounded-lg bg-[var(--st-art)]" />
    </div>
  ),
  Marketing: () => (
    <div className="flex w-44 flex-col items-center gap-2">
      <Bar className="h-2.5 w-36 bg-[var(--st-art-strong)]" />
      <Bar className="h-2.5 w-28 bg-[var(--st-art-strong)]" />
      <Bar className="mt-0.5 w-24" />
      <div className="mt-1.5 flex gap-1.5">
        <span className="h-5 w-12 rounded-md bg-[var(--st-art-ink)]" />
        <Panel className="h-5 w-12 rounded-md" />
      </div>
    </div>
  ),
  Experimental: () => (
    <div className="relative size-20">
      <span className="absolute top-0 left-3 size-12 rounded-full border border-[var(--st-art-strong)]" />
      <span className="absolute right-0 bottom-1 size-12 rounded-full bg-[var(--st-art)]" />
      <span className="absolute bottom-0 left-0 size-9 rounded-full border border-dashed border-[var(--st-art-strong)]" />
      <span className="absolute top-[38%] left-[42%] size-2 rounded-full bg-[var(--st-art-ink)]" />
    </div>
  ),
}

export function CategoryArt({ category, className }: { category: ComponentCategory; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex items-center justify-center", className)}>
      {ART[category]()}
    </div>
  )
}
