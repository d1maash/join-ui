import type * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Contents } from "@/components/variants/specimen/contents"
import { CoverTitle } from "@/components/variants/specimen/cover"
import { PURPOSE, getPlateIndex, href, plateNo } from "@/components/variants/specimen/plates"
import { SpecimenPlate } from "@/components/variants/specimen/scenes"
import { Keycap } from "@/components/variants/specimen/type"
import { shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { getComponent } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import type { ComponentMetadata } from "@/types/registry"

export const metadata: Metadata = {
  title: { absolute: "Join UI — Field manual for interfaces that move" },
  description: siteConfig.description,
  robots: { index: false, follow: false },
}

const STATUS: Record<string, string> = {
  new: "New",
  stable: "Stable",
  updated: "Updated",
  experimental: "Experimental",
}

async function datasheet(component: ComponentMetadata) {
  const sources = await getComponentSources(component)
  const lines = sources.reduce((sum, source) => sum + source.content.split("\n").length, 0)
  return {
    component,
    no: plateNo(component.slug),
    rows: [
      ["Category", component.category],
      ["Packages", component.dependencies.join(", ") || "none"],
      ["Source", `${lines.toLocaleString("en-US")} lines · ${sources.length} file`],
      [
        "Keyboard",
        component.keyboard.length
          ? component.keyboard.map((entry) => entry.keys.join(" / ")).slice(0, 3).join(" · ")
          : "no keys of its own",
      ],
      ["Access", `${component.accessibility.length} notes · AA`],
      ["Install", `${siteConfig.namespace}/${component.slug}`],
    ] as Array<[string, string]>,
  }
}

const PRINCIPLES = [
  {
    title: "Yours, not ours.",
    body: "The CLI writes the component into your repository as plain TypeScript. No wrapper package, no version to wait for. Change a line and it stays changed.",
    proof: `${siteConfig.installTarget}/approval-gate.tsx`,
  },
  {
    title: "Briefed for agents.",
    body: "Every plate carries a Copy prompt: props, keyboard map, accessibility rules and the real source in one brief for Claude Code, Cursor or Codex. It is built from the same record as the page, so it cannot invent a prop.",
    proof: "Copy prompt → approval-gate.prompt.txt",
  },
  {
    title: "Usable without a mouse, or without sight.",
    body: "Keyboard paths, live regions, and a word behind every colour. WCAG 2.2 AA is where a plate starts, not a pass at the end.",
    proof: 'aria-live="polite" · :focus-visible',
  },
  {
    title: "Moves only to explain.",
    body: "A step advances, a request expires, a line is written. Nothing loops at rest, everything is transform and opacity, and with reduced motion each plate is a finished still.",
    proof: "prefers-reduced-motion: reduce",
  },
]

export default async function SpecimenLanding() {
  const plates = getPlateIndex()
  const gate = getComponent("approval-gate")!
  const trace = getComponent("tool-trace")!
  const hive = getComponent("agent-hive")!
  const [gateSheet, traceSheet, hiveSheet] = await Promise.all([
    datasheet(gate),
    datasheet(trace),
    datasheet(hive),
  ])
  const gateSources = await getComponentSources(gate)
  const prompt = buildComponentPrompt({ component: gate, sources: gateSources })

  return (
    <main id="main-content">
      {/* ─── Cover ───────────────────────────────────────────────────────── */}
      <section aria-label="Cover" className="sp-wrap pt-6 lg:pt-8">
        <dl className="sp-grid border-y border-[var(--sp-ink)] py-2.5">
          <CoverFact className="col-span-2 lg:col-span-3" term="Title" value="Join UI — Field manual" />
          <CoverFact className="col-span-2 lg:col-span-2" term="Volume" value="One" />
          <CoverFact className="hidden lg:col-span-2 lg:block" term="Contents" value="Seven plates" />
          <CoverFact className="hidden lg:col-span-2 lg:block" term="For" value="Agent interfaces" />
          <CoverFact className="hidden lg:col-span-2 lg:block" term="Licence" value="MIT" />
          <CoverFact className="hidden lg:col-span-1 lg:block" term="Ed." value="11.26" />
        </dl>

        <div className="pt-10 lg:pt-14">
          <CoverTitle
            note={
              <>
                <span className="font-semibold text-[var(--sp-ink)]">Fig. 0 — this line is PL. 03.</span>{" "}
                Carbon Copy sets the first line, copies it down, and turns over only the
                words that changed.
              </>
            }
          />
        </div>

        <div className="sp-grid mt-12 items-end gap-y-8 border-t border-[var(--sp-rule)] pt-6 lg:mt-16">
          <p className="col-span-4 max-w-[46ch] text-[19px] leading-[1.5] text-pretty lg:col-span-6">
            Seven React components for products where an agent does the work and a person
            signs off. Each is drawn up here as a plate — parts lettered, keys listed,
            source attached — and installs through the shadcn CLI as files you keep.
          </p>
          <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:justify-end">
            <a
              href="#contents"
              className="group inline-flex h-12 items-center gap-3 bg-[var(--sp-ink)] pr-5 pl-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a28]"
            >
              Open the manual
              <ArrowDown
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </a>
            <span className="sp-mono text-[12px] text-[var(--sp-ink-2)]">
              or <Keycap small>⌘</Keycap> <Keycap small>K</Keycap> to look something up
            </span>
          </div>
        </div>
      </section>

      {/* ─── Contents ────────────────────────────────────────────────────── */}
      <section
        id="contents"
        aria-labelledby="contents-title"
        data-running="Contents"
        className="sp-wrap mt-28 scroll-mt-16 lg:mt-40"
      >
        <div className="sp-grid mb-8 items-end gap-y-3">
          <h2
            id="contents-title"
            className="sp-display col-span-4 text-[clamp(44px,5.6vw,80px)] lg:col-span-7"
          >
            Contents
          </h2>
          <p className="col-span-4 text-[15px] leading-[1.5] text-[var(--sp-ink-2)] lg:col-span-5">
            Seven plates, in reading order. Point at one to see it run; open it for the
            full drawing, the specification and the source.
          </p>
        </div>
        <Contents
          entries={plates.map((plate) => ({
            slug: plate.slug,
            no: plate.no,
            title: plate.title,
            purpose: PURPOSE[plate.slug] ?? plate.description,
            category: plate.category,
            status: STATUS[plate.status] ?? plate.status,
            href: plate.href,
          }))}
        />
      </section>

      {/* ─── Plate: Approval Gate, as a state diagram ────────────────────── */}
      <section
        aria-labelledby="pl-gate"
        data-running={`PL. ${gateSheet.no} — ${gate.title}`}
        className="sp-wrap mt-36 lg:mt-52"
      >
        <PlateHead
          id="pl-gate"
          sheet={gateSheet}
          kicker="State diagram"
          lede="One request, three ways out. The live gate on the left is the real component — click into it and answer with Y or N, or let the clock run down — and the path it takes is inked on the right."
        />
        <SpecimenPlate
          slug="approval-gate"
          fig={`FIG. ${gateSheet.no}.1`}
          note="Live · 30 s clock"
          className="mt-12"
          stageClassName="pt-16 pb-14 lg:px-16"
          caption="The waiting state, lettered, and the three states it can resolve into."
        />
      </section>

      {/* ─── Plate: Tool Trace, component left, annotations right ─────────── */}
      <section
        aria-labelledby="pl-trace"
        data-running={`PL. ${traceSheet.no} — ${trace.title}`}
        className="sp-wrap mt-36 lg:mt-52"
      >
        <SpecimenPlate
          slug="tool-trace"
          fig={`FIG. ${traceSheet.no}.1`}
          note="Live · plays while on screen"
          stageClassName="min-h-[600px] py-16"
          caption="A run of four tools. Each opens as it starts, writes, then folds away."
        />
        <PlateHead
          id="pl-trace"
          sheet={traceSheet}
          kicker="Exploded view"
          className="mt-14"
          lede="The trace an agent leaves as it works: the step in flight opens itself, writes its output a line at a time, then folds away and goes still — so a long run reads at a glance and a failure stays open."
        />
      </section>

      {/* ─── Plate: Agent Hive, centred, callouts either side ───────────── */}
      <section
        aria-labelledby="pl-hive"
        data-running={`PL. ${hiveSheet.no} — ${hive.title}`}
        className="sp-wrap mt-36 lg:mt-52"
      >
        <PlateHead
          id="pl-hive"
          sheet={hiveSheet}
          kicker="Plan view"
          lede="Pick the model, dispatch the run, watch the queue. A comb of frosted glass with one tinted tile that travels to whatever you pick — arrow keys walk it, the action fires it."
        />
        <SpecimenPlate
          slug="agent-hive"
          fig={`FIG. ${hiveSheet.no}.1`}
          note="Live · pick a tile"
          className="mt-12"
          stageClassName="min-h-[620px] py-16"
          caption="The comb from above, with the queue it feeds."
        />
      </section>

      {/* ─── Principles ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="principles-title"
        data-running="Principles"
        className="sp-wrap mt-40 lg:mt-56"
      >
        <div className="sp-grid gap-y-12">
          <div className="col-span-4 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--sp-head)+40px)]">
              <p className="sp-label">Principles</p>
              <h2
                id="principles-title"
                className="sp-display mt-4 text-[clamp(40px,4.6vw,64px)] leading-[0.95]"
              >
                Good interface code is…
              </h2>
              <p className="sp-serif mt-6 max-w-[26ch] text-[21px] leading-[1.3] text-[var(--sp-ink-2)]">
                Four rules every plate is drawn to, after Dieter Rams, who needed ten.
              </p>
            </div>
          </div>
          <ol className="col-span-4 border-t border-[var(--sp-ink)] lg:col-span-8">
            {PRINCIPLES.map((principle, index) => (
              <li
                key={principle.title}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[var(--sp-rule)] py-8 sm:grid-cols-[5.5rem_1fr] lg:py-10"
              >
                <span className="sp-display text-[clamp(44px,5vw,72px)] leading-[0.8] tracking-[-0.04em]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[clamp(26px,2.6vw,36px)] leading-[1.08] font-semibold tracking-[-0.025em]">
                    {principle.title}
                  </h3>
                  <p className="mt-3 max-w-[58ch] text-[17px] leading-[1.6] text-[var(--sp-ink-2)]">
                    {principle.body}
                  </p>
                  <p className="sp-mono mt-4 text-[12px] text-[var(--sp-ink)]">
                    <span aria-hidden="true" className="mr-2 text-[var(--sp-signal)]">
                      →
                    </span>
                    {principle.proof}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Procedure ───────────────────────────────────────────────────── */}
      <section
        id="install"
        aria-labelledby="procedure-title"
        data-running="Procedure"
        className="sp-wrap mt-40 scroll-mt-16 lg:mt-56"
      >
        <div className="sp-grid items-end gap-y-4 border-b border-[var(--sp-ink)] pb-6">
          <div className="col-span-4 lg:col-span-7">
            <p className="sp-label">Procedure</p>
            <h2
              id="procedure-title"
              className="sp-display mt-4 text-[clamp(40px,4.6vw,64px)] leading-[0.95]"
            >
              Installing a plate
            </h2>
          </div>
          <p className="col-span-4 text-[15px] leading-[1.5] text-[var(--sp-ink-2)] lg:col-span-4 lg:col-start-9">
            Three steps, about a minute. You need a Next.js app with Tailwind and the
            shadcn CLI initialised.
          </p>
        </div>

        <ol>
          <ProcedureStep
            n="1"
            title="Point the CLI at the registry."
            body={
              <>
                Add the {siteConfig.namespace} namespace to{" "}
                <code className="sp-mono text-[0.85em]">components.json</code>. Once per project.
              </>
            }
          >
            <CodeBlock
              code={`{\n  "registries": {\n    "${siteConfig.namespace}": "${siteConfig.url}/r/{name}.json"\n  }\n}`}
              language="json"
              title="components.json"
            />
          </ProcedureStep>
          <ProcedureStep
            n="2"
            title="Add a plate."
            body={
              <>
                The file is written to{" "}
                <code className="sp-mono text-[0.85em]">{siteConfig.installTarget}/</code>, with its
                packages. It is yours from here.
              </>
            }
          >
            <PackageManagerTabs
              commands={shadcnCommands(`${siteConfig.namespace}/approval-gate`)}
              label="Install Approval Gate"
            />
          </ProcedureStep>
          <ProcedureStep
            n="3"
            title="Or hand it to your agent."
            body="Copy the plate's brief and paste it into Claude Code, Cursor or Codex. It carries the props, the keys, the accessibility rules and the source."
          >
            <div className="flex flex-wrap items-center gap-4 border border-[var(--sp-rule)] bg-[var(--sp-sheet)] p-4">
              <div className="sp-btns">
                <CopyPromptButton prompt={prompt} componentName={gate.title} variant="primary" />
              </div>
              <p className="sp-mono min-w-0 flex-1 truncate text-[12px] text-[var(--sp-ink-2)]">
                approval-gate.prompt.txt · {prompt.split("\n").length} lines
              </p>
            </div>
          </ProcedureStep>
        </ol>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
          <p className="sp-serif text-[21px] text-[var(--sp-ink-2)]">
            The long version, with every option, is in the manual.
          </p>
          <Link
            href={href("/docs/installation")}
            className="group inline-flex items-center gap-2 text-[15px] font-semibold underline decoration-[var(--sp-rule-strong)] underline-offset-[6px] hover:decoration-[var(--sp-ink)]"
          >
            Read the installation chapter
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </main>
  )
}

function CoverFact({
  term,
  value,
  className,
}: {
  term: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="sp-label">{term}</dt>
      <dd className="mt-0.5 text-[14px] font-medium">{value}</dd>
    </div>
  )
}

type Sheet = Awaited<ReturnType<typeof datasheet>>

function PlateHead({
  id,
  sheet,
  kicker,
  lede,
  className,
}: {
  id: string
  sheet: Sheet
  kicker: string
  lede: string
  className?: string
}) {
  const { component, no, rows } = sheet
  return (
    <header className={className}>
      <div className="flex items-baseline justify-between border-t border-[var(--sp-ink)] pt-3">
        <p className="sp-label !text-[var(--sp-ink)]">Plate {no}</p>
        <p className="sp-label">{kicker}</p>
      </div>
      <div className="sp-grid mt-8 gap-y-10">
        <div className="col-span-4 lg:col-span-7">
          <h2 id={id} className="sp-display text-[clamp(48px,6.6vw,96px)] leading-[0.92]">
            <span className="sp-mono mr-4 align-top text-[13px] font-medium tracking-normal text-[var(--sp-ink-2)]">
              PL. {no}
            </span>
            {component.title}
          </h2>
          <p className="mt-6 max-w-[52ch] text-[18px] leading-[1.55] text-pretty text-[var(--sp-ink-2)]">
            {lede}
          </p>
          <Link
            href={href(`/components/${component.slug}`)}
            className="group mt-6 inline-flex items-center gap-2 text-[15px] font-semibold underline decoration-[var(--sp-rule-strong)] underline-offset-[6px] hover:decoration-[var(--sp-ink)]"
          >
            Open plate {no}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <dl className="col-span-4 self-end border-t border-[var(--sp-ink)] lg:col-span-4 lg:col-start-9">
          <div className="flex items-baseline justify-between py-2">
            <dt className="sp-label !text-[var(--sp-ink)]">Datasheet</dt>
            <dd className="sp-label">{STATUS[component.status]}</dd>
          </div>
          {rows.map(([term, value]) => (
            <div
              key={term}
              className="flex items-baseline gap-3 border-t border-[var(--sp-rule)] py-2"
            >
              <dt className="sp-label w-20 shrink-0">{term}</dt>
              <dd className="sp-mono min-w-0 truncate text-[12.5px] text-[var(--sp-ink)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

function ProcedureStep({
  n,
  title,
  body,
  children,
}: {
  n: string
  title: string
  body: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="sp-grid gap-y-5 border-b border-[var(--sp-rule)] py-10">
      <span className="sp-display col-span-1 text-[56px] leading-[0.8] tracking-[-0.04em] lg:col-span-1">
        {n}
      </span>
      <div className="col-span-3 lg:col-span-4">
        <h3 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mt-3 max-w-[40ch] text-[16px] leading-[1.6] text-[var(--sp-ink-2)]">{body}</p>
      </div>
      <div className="sp-code col-span-4 min-w-0 lg:col-span-6 lg:col-start-7">{children}</div>
    </li>
  )
}
