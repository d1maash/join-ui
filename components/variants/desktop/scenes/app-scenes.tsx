"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcw, Sparkle } from "lucide-react"

import { AgentHive, type AgentHiveModel, type AgentHiveRun } from "@/registry/components/agent-hive"
import { ApprovalGate, type ApprovalGateDecision } from "@/registry/components/approval-gate"
import { CarbonCopy } from "@/registry/components/carbon-copy"
import { FocusStack } from "@/registry/components/focus-stack"
import { CrestQuiet, GlassCrest } from "@/registry/components/glass-crest"
import { MODELS, PROMPTS } from "@/components/previews/fixtures/agent-hive"
import { SYSTEM } from "@/components/previews/fixtures/focus-stack"
import { MARKS } from "@/components/previews/fixtures/glass-crest"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import { AppIcon } from "../app-icon"
import { tagColour, vh, type ComponentInfo } from "../apps"

/*
 * What each app shows when it is opened from the Dock: the component doing
 * the one thing it is for, at the size it was designed for, with nothing
 * around it but the window.
 */

export function ApprovalGateApp() {
  const [decision, setDecision] = React.useState<ApprovalGateDecision | null>(null)
  return (
    <div className="flex flex-col gap-3 p-4">
      <ApprovalGate
        title="Reinstall the dependencies"
        reason="The lockfile no longer matches node_modules."
        tool="bash"
        meta="~/acme-app"
        prefix="$"
        command="rm -rf node_modules .next && pnpm install"
        risk="high"
        timeout={30_000}
        decision={decision}
        onDecision={setDecision}
      />
      <div className="flex items-center justify-between px-1">
        <code className="font-mono text-[12px] text-[var(--d-ink-3)]">
          {decision === null ? "onDecision — waiting" : `onDecision("${decision}")`}
        </code>
        <button type="button" className="d-btn" onClick={() => setDecision(null)} disabled={decision === null}>
          <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
          Ask again
        </button>
      </div>
    </div>
  )
}

const RUN_MS = 3200

export function AgentHiveApp({ size = "md" }: { size?: "sm" | "md" }) {
  const [runs, setRuns] = React.useState<AgentHiveRun[]>([
    { id: "seed-1", prompt: "Rewrite the onboarding copy for the empty dashboard", modelId: "prism", state: "done" },
    { id: "seed-2", prompt: "Trace the failing checkout webhook back to its retry", modelId: "aster", state: "failed" },
  ])
  const [model, setModel] = React.useState("prism")
  const counter = React.useRef(0)
  const timers = React.useRef<number[]>([])

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  function generate(picked: AgentHiveModel) {
    counter.current += 1
    const id = `run-${counter.current}`
    const prompt = PROMPTS[(counter.current - 1) % PROMPTS.length] ?? ""
    setRuns((current) => [{ id, prompt, modelId: picked.id, state: "working" as const }, ...current].slice(0, 5))
    timers.current.push(
      window.setTimeout(() => {
        setRuns((current) => current.map((run) => (run.id === id ? { ...run, state: "done" as const } : run)))
      }, RUN_MS)
    )
  }

  return (
    <div className="flex justify-center px-5 pt-5 pb-4">
      <AgentHive
        label="Model"
        models={MODELS}
        value={model}
        onValueChange={setModel}
        runs={runs}
        onGenerate={generate}
        size={size}
        variant="plain"
        className="w-full"
      />
    </div>
  )
}

export function FocusStackApp() {
  return (
    <div className="flex min-h-[340px] items-center justify-center px-6 py-8">
      <FocusStack label="Design system" items={SYSTEM} mode="auto" size="sm" />
    </div>
  )
}

export function GlassCrestApp() {
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6">
      <GlassCrest
        size="sm"
        marks={MARKS}
        spread={124}
        overlap={0.36}
        crestLabel="Pick an asset"
        headingLevel={3}
        eyebrow="Glass Crest"
        eyebrowIcon={<Sparkle />}
        headline={
          <>
            Pick one to <CrestQuiet>begin</CrestQuiet>
          </>
        }
        onMarkSelect={(mark) => setPicked(mark.label)}
      />
      <p className="text-[13px] text-[var(--d-ink-3)]">
        {picked ? (
          <>
            Selected <span className="font-semibold text-[var(--d-ink)]">{picked}</span>
          </>
        ) : (
          "Pull a disc out of the arc, or click one."
        )}
      </p>
    </div>
  )
}

export function CarbonCopyApp({ take }: { take: number }) {
  return (
    <div className="flex min-h-[230px] items-center px-8 py-10">
      <CarbonCopy
        key={take}
        as="h3"
        align="start"
        trigger="mount"
        lines={["Copy the code.", "Keep the code."]}
        className="text-[clamp(2.4rem,4.2vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
      />
    </div>
  )
}

/* ── Catalog: a Finder for the registry ────────────────────────────────── */

export function CatalogApp({ components }: { components: ComponentInfo[] }) {
  const [tag, setTag] = React.useState<string | null>(null)
  const categories = [...new Set(components.map((component) => component.category))]
  const shown = tag ? components.filter((component) => component.category === tag) : components

  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Catalog sidebar" className="w-[176px] shrink-0 border-r border-[var(--d-hair)] bg-[rgb(255_255_255/0.03)] px-2.5 py-3 text-[13px]">
        <p className="px-2 pb-1 text-[11px] font-semibold text-[var(--d-ink-3)]">Favourites</p>
        <SidebarRow active={tag === null} onClick={() => setTag(null)}>
          <AppIcon id="catalog" className="size-4" />
          All components
        </SidebarRow>
        <Link href={vh("/docs")} className="flex h-7 items-center gap-2 rounded-md px-2 text-[var(--d-ink)] hover:bg-white/8">
          <AppIcon id="docs" className="size-4" />
          Docs
        </Link>
        <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-[var(--d-ink-3)]">Tags</p>
        {categories.map((category) => (
          <SidebarRow key={category} active={tag === category} onClick={() => setTag(category)}>
            <span className="size-2.5 rounded-full" style={{ background: tagColour(category) }} />
            {category}
          </SidebarRow>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <ul className="grid flex-1 content-start gap-x-2 gap-y-4 p-5 [grid-template-columns:repeat(auto-fill,minmax(112px,1fr))]">
          {shown.map((component) => (
            <li key={component.slug}>
              <Link
                href={vh(`/components/${component.slug}`)}
                className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center hover:bg-white/6 focus-visible:bg-white/6"
              >
                <AppIcon id={component.slug} className="size-16 drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]" />
                <span className="rounded px-1.5 text-[12.5px] leading-tight font-medium group-hover:bg-[var(--d-blue)] group-focus-visible:bg-[var(--d-blue)]">
                  {component.title}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[var(--d-ink-3)]">
                  <span className="size-1.5 rounded-full" style={{ background: tagColour(component.category) }} />
                  {component.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex h-7 shrink-0 items-center justify-between border-t border-[var(--d-hair)] px-3 text-[11.5px] text-[var(--d-ink-3)]">
          <span>
            Join UI › Components{tag ? ` › ${tag}` : ""}
          </span>
          <span>
            {shown.length} {shown.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </div>
  )
}

function SidebarRow({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[var(--d-ink)]",
        active ? "bg-white/14" : "hover:bg-white/8"
      )}
    >
      {children}
    </button>
  )
}

/* ── About ─────────────────────────────────────────────────────────────── */

const FACTS: Array<[string, string]> = [
  ["Components", "7, all source"],
  ["Registry", "@joinui, via the shadcn CLI"],
  ["Agents", "Copy prompt on every page"],
  ["Accessibility", "WCAG 2.2 AA"],
  ["Motion", "Reduced-motion fallbacks"],
  ["Licence", "MIT"],
]

export function AboutApp() {
  return (
    <div className="flex flex-col items-center px-8 pt-6 pb-7 text-center">
      <AppIcon id="about" className="size-24 drop-shadow-[0_10px_18px_rgb(0_0_0/0.45)]" />
      <h3 className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">Join UI</h3>
      <p className="mt-0.5 text-[13px] text-[var(--d-ink-3)]">Motion-first React components you own</p>
      <dl className="mt-5 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-left text-[12.5px]">
        {FACTS.map(([term, value]) => (
          <React.Fragment key={term}>
            <dt className="text-right font-medium text-[var(--d-ink-2)]">{term}</dt>
            <dd className="text-[var(--d-ink)]">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <div className="mt-6 flex gap-2">
        <Link href={vh("/docs")} className="d-btn">
          Read the docs
        </Link>
        <a href={siteConfig.links.repo} target="_blank" rel="noreferrer noopener" className="d-btn">
          GitHub
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}
