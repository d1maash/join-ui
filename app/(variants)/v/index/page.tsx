import type * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { IxCell } from "@/components/variants/index/cell"
import { IxCode } from "@/components/variants/index/code"
import { formatDate, plural } from "@/components/variants/index/codes"
import { IxCommand } from "@/components/variants/index/command"
import { IxCopyButton } from "@/components/variants/index/copy"
import {
  getIxCategories,
  getIxItem,
  getIxItems,
  getLastChange,
  ixHref,
} from "@/components/variants/index/data"
import { IxSearchTrigger } from "@/components/variants/index/search"
import { IxGutter, IxIndexColumns, IxSectionHead } from "@/components/variants/index/sections"
import { shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { getComponent, getFeaturedComponents } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Live components, installed as source` },
  robots: { index: false, follow: false },
}

const FACTS = [
  { label: "Runtime", value: "React 19" },
  { label: "Styling", value: "Tailwind v4" },
  { label: "Animation", value: "Motion" },
  { label: "Install", value: "shadcn CLI" },
  { label: "Access", value: "WCAG 2.2 AA" },
  { label: "License", value: "MIT" },
]

const AGENTS = [
  { name: "Claude Code", kind: "terminal" },
  { name: "Cursor", kind: "editor" },
  { name: "Codex", kind: "cli · cloud" },
]

const LATEST = 6

export default async function IndexHome() {
  const items = getIxItems()
  const categories = getIxCategories()
  const total = items.length
  const lastChange = getLastChange()

  /* The hero cell: the newest featured component, else the newest of all. */
  const featuredMeta = getFeaturedComponents(1)[0]
  const featured = (featuredMeta && getIxItem(featuredMeta.slug)) ?? items[0]
  const newest = items[0]
  /* Latest leaves out the hero cell, so a small registry shows each component once. */
  const latest = items.filter((item) => item.id !== featured?.id).slice(0, LATEST)

  const featuredComponent = featured ? getComponent(featured.slug) : undefined
  const promptHead = featuredComponent
    ? buildComponentPrompt({
        component: featuredComponent,
        sources: await getComponentSources(featuredComponent),
      })
        .split("\n")
        .slice(0, 9)
        .join("\n")
    : null

  const target = featured ? `${siteConfig.namespace}/${featured.slug}` : `${siteConfig.namespace}/<component>`
  const ask = `Add ${target} to my app`

  return (
    <main id="main-content" className="flex-1">
      {/* ---------------------------------------------------------- hero */}
      <section aria-labelledby="ix-hero-title" className="ix-frame ix-rule-b">
        <dl className="ix-mono ix-rule-b grid grid-cols-2 md:grid-cols-4">
          {[
            ["Library", `${siteConfig.name} · open source`],
            ["Index", `${plural(total, "component")} · ${plural(categories.length, "category", "categories")}`],
            ["Last change", lastChange ? formatDate(lastChange) : "—"],
            ["Registry", siteConfig.namespace],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={
                "flex h-10 items-center gap-2 px-4 " +
                (index % 2 === 1 ? "" : "border-r border-[var(--ix-line)] ") +
                (index === 1 ? "md:border-r " : "") +
                (index < 2 ? "border-b border-[var(--ix-line)] md:border-b-0" : "")
              }
            >
              <dt className="ix-fg-3 hidden sm:block">{label}</dt>
              <dd className="truncate text-[var(--ix-fg-2)]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_29rem] xl:grid-cols-[minmax(0,1fr)_33rem]">
          <div className="@container flex flex-col justify-between gap-12 px-5 pt-10 pb-8 md:px-8 md:pt-14 lg:border-r lg:border-[var(--ix-line)] lg:px-10 lg:pb-10">
            <h1
              id="ix-hero-title"
              className="text-[length:max(2.375rem,min(4.75rem,9.7cqi))] leading-[0.95] font-semibold tracking-[-0.05em]"
            >
              Live on this page.
              <br />
              <span className="text-[var(--ix-fg-2)]">Yours in one command.</span>
            </h1>
            <div className="flex flex-col gap-7">
              <p className="ix-fg-2 max-w-[34rem] text-base leading-relaxed text-pretty md:text-[1.0625rem]">
                Motion-first React components for Next.js. Every cell below runs the real
                component; the shadcn CLI writes the same file into your project, or one
                copied prompt has your coding agent do it.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={ixHref("/components")} className="ix-btn ix-btn-primary !h-10 !px-4">
                  Browse {plural(total, "component")}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <IxSearchTrigger label="Search" className="!h-10 !px-3.5 !text-[0.8125rem] !text-[var(--ix-fg-2)]" />
              </div>
            </div>
          </div>

          {featured ? (
            <IxCell
              item={featured}
              size="lg"
              replay
              className="border-t border-[var(--ix-line)] lg:border-t-0"
            />
          ) : null}
        </div>

        <div className="grid grid-cols-1 border-t border-[var(--ix-line)] lg:grid-cols-[minmax(0,1fr)_29rem] xl:grid-cols-[minmax(0,1fr)_33rem]">
          <div className="flex items-center gap-4 px-5 py-4 md:px-8 lg:border-r lg:border-[var(--ix-line)] lg:px-10">
            <div className="min-w-0 flex-1">
              <p className="ix-mono ix-fg-3">Ask your agent</p>
              <p className="ix-mono mt-1.5 truncate text-[0.875rem] text-[var(--ix-fg)] md:text-[0.9375rem]">
                <span aria-hidden="true" className="ix-accent mr-2.5">
                  ›
                </span>
                {ask}
              </p>
            </div>
            <IxCopyButton value={ask} label="Copy the request" hideLabel toastMessage="Request copied" />
          </div>
          {newest ? (
            <Link
              href={ixHref(`/components/${newest.slug}`)}
              className="group flex items-center gap-4 border-t border-[var(--ix-line)] px-5 py-4 transition-colors hover:bg-white/[0.015] md:px-8 lg:border-t-0 lg:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="ix-mono ix-fg-3">Newest · {formatDate(newest.since)}</p>
                <p className="mt-1.5 truncate text-[0.9375rem] font-medium">
                  <span className="ix-mono ix-accent mr-2.5 text-[0.8125rem]">{newest.code}</span>
                  {newest.title}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="ix-fg-3 size-4 shrink-0 transition-colors group-hover:text-[var(--ix-fg)]"
              />
            </Link>
          ) : null}
        </div>
      </section>

      <ul aria-label="Stack" className="ix-frame ix-rule-b grid grid-cols-3 md:grid-cols-6">
        {FACTS.map((fact, index) => (
          <li
            key={fact.label}
            className={
              "flex flex-col gap-1 px-4 py-3.5 " +
              (index % 3 !== 2 ? "border-r border-[var(--ix-line)] " : "md:border-r ") +
              (index === FACTS.length - 1 ? "md:border-r-0 " : "") +
              (index < 3 ? "border-b border-[var(--ix-line)] md:border-b-0" : "")
            }
          >
            <span className="ix-mono ix-fg-3 text-[0.6875rem] tracking-[0.04em] uppercase">{fact.label}</span>
            <span className="text-[0.875rem] font-medium tracking-[-0.01em]">{fact.value}</span>
          </li>
        ))}
      </ul>

      <IxGutter />

      {/* -------------------------------------------------------- latest */}
      <section aria-labelledby="ix-latest">
        <IxSectionHead
          index="01"
          id="ix-latest"
          title="Latest"
          description="The newest additions to the registry, running live. Open a cell for its page, or take its prompt or install command without leaving this one."
          action={
            <Link
              href={ixHref("/components")}
              className="ix-mono ix-fg-2 inline-flex w-fit items-center gap-1.5 hover:text-[var(--ix-fg)]"
            >
              All {total} in the catalog
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        />
        <div className="ix-frame ix-rule-b">
          <ul className="ix-cells" data-cols="3">
            {latest.map((item) => (
              <li key={item.id} className="flex">
                <IxCell item={item} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <IxGutter />

      {/* ------------------------------------------------- the index */}
      <section aria-labelledby="ix-all">
        <IxSectionHead
          index="02"
          id="ix-all"
          title="All components"
          description={`Every component by category, each with its index code. ${plural(total, "name")} across ${plural(categories.length, "category", "categories")}; each opens its page.`}
        />
        <IxIndexColumns categories={categories} />
      </section>

      <IxGutter />

      {/* ------------------------------------------------------ install */}
      <section aria-labelledby="ix-install">
        <IxSectionHead
          index="03"
          id="ix-install"
          title="Install"
          description="Components install through the shadcn CLI from the @joinui registry, as source files you own — or as a brief your coding agent follows."
        />
        <div className="ix-frame ix-rule-b grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col gap-8 px-5 py-8 md:px-8 lg:border-r lg:border-[var(--ix-line)] lg:px-10 lg:py-10">
            <Step n="01" title="Point the CLI at the registry" note="Once per project.">
              <IxCode
                code={`{\n  "registries": {\n    "${siteConfig.namespace}": "${siteConfig.url}/r/{name}.json"\n  }\n}`}
                language="json"
                title="components.json"
              />
            </Step>
            <Step n="02" title="Add a component by name" note="The file lands in components/joinui.">
              <IxCommand commands={shadcnCommands(target)} label="Package manager" />
            </Step>
          </div>
          <div className="flex flex-col gap-8 border-t border-[var(--ix-line)] px-5 py-8 md:px-8 lg:border-t-0 lg:px-10 lg:py-10">
            <Step
              n="03"
              title="Or paste a prompt into your agent"
              note="Every cell's Prompt button copies a brief built from the component's metadata and its real source."
            >
              <ul className="grid grid-cols-3 border border-[var(--ix-line)]">
                {AGENTS.map((agent, index) => (
                  <li
                    key={agent.name}
                    className={
                      "flex flex-col gap-1 px-3 py-3 " +
                      (index > 0 ? "border-l border-[var(--ix-line)]" : "")
                    }
                  >
                    <span className="text-[0.875rem] font-medium">{agent.name}</span>
                    <span className="ix-mono ix-fg-3">{agent.kind}</span>
                  </li>
                ))}
              </ul>
              {promptHead && featured ? (
                <div className="ix-codebox mt-3">
                  <div className="ix-codebar">
                    <span className="ix-mono flex-1 truncate text-[var(--ix-fg-2)]">
                      {featured.slug}.prompt.txt
                    </span>
                    <Link
                      href={ixHref(`/components/${featured.slug}#prompt`)}
                      className="ix-mono ix-fg-3 px-2 hover:text-[var(--ix-fg)]"
                    >
                      full prompt ›
                    </Link>
                  </div>
                  <pre className="ix-fg-2 overflow-hidden px-4 py-3.5 text-[0.75rem] leading-[1.7] whitespace-pre-wrap [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                    {promptHead}
                  </pre>
                </div>
              ) : null}
            </Step>
          </div>
        </div>
      </section>

      <IxGutter />
    </main>
  )
}

function Step({
  n,
  title,
  note,
  children,
}: {
  n: string
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span className="ix-mono ix-accent">{n}</span>
        <div>
          <h3 className="text-[0.9375rem] font-semibold tracking-[-0.015em]">{title}</h3>
          <p className="ix-fg-3 mt-0.5 text-[0.8125rem] leading-relaxed">{note}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
