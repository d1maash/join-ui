import type * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { GlassCopy } from "@/components/variants/glass/copy"
import { HeroScene } from "@/components/variants/glass/hero-scene"
import { InstallDemo } from "@/components/variants/glass/install-demo"
import { StillDemo } from "@/components/variants/glass/still-demo"
import { ComponentTile } from "@/components/variants/glass/tile"
import { g, pill, textLink } from "@/components/variants/glass/ui"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRegistryStats } from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Made to move. Yours to keep.",
  description: siteConfig.description,
}

/*
 * The lineup, laid out as a bento: two wide rows framing a row of three. The
 * order is chosen for the eye — the agent pieces lead, the type and the hero
 * section close — and anything not named here still appears, at the end.
 */
const BENTO: Array<{ slug: string; span: string; well: string; size: "lg" | "md" }> = [
  { slug: "tool-trace", span: "lg:col-span-7", well: "lg:h-[360px]", size: "lg" },
  { slug: "approval-gate", span: "lg:col-span-5", well: "lg:h-[360px]", size: "lg" },
  { slug: "agent-hive", span: "lg:col-span-4", well: "lg:h-[270px]", size: "md" },
  { slug: "status-timeline", span: "lg:col-span-4", well: "lg:h-[270px]", size: "md" },
  { slug: "focus-stack", span: "lg:col-span-4", well: "lg:h-[270px]", size: "md" },
  { slug: "carbon-copy", span: "lg:col-span-5", well: "lg:h-[360px]", size: "lg" },
  { slug: "glass-crest", span: "lg:col-span-7", well: "lg:h-[360px]", size: "lg" },
]

const PROMPT_SLUG = "tool-trace"

const numberWords = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"]

export default async function GlassHome() {
  const stats = getRegistryStats()
  const count = numberWords[stats.total] ?? String(stats.total)

  const placed = new Set(BENTO.map((entry) => entry.slug))
  const lineup = [
    ...BENTO.flatMap((entry) => {
      const component = getComponent(entry.slug)
      return component ? [{ ...entry, item: toCatalogItem(component) }] : []
    }),
    ...allComponents
      .filter((component) => !placed.has(component.slug))
      .map((component) => ({
        slug: component.slug,
        span: "lg:col-span-4",
        well: "lg:h-[270px]",
        size: "md" as const,
        item: toCatalogItem(component),
      })),
  ]

  const installItems = allComponents.map((component) => ({
    slug: component.slug,
    title: component.title,
    dependencies: component.dependencies,
    target: component.files[0]?.target ?? `${siteConfig.installTarget}/${component.slug}.tsx`,
  }))

  const promptComponent = getComponent(PROMPT_SLUG) ?? allComponents[0]
  const prompt = promptComponent
    ? buildComponentPrompt({
        component: promptComponent,
        sources: await getComponentSources(promptComponent),
      })
    : ""
  const promptExcerpt = prompt.split("\n").slice(0, 26).join("\n")

  return (
    <main id="main-content" className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="px-4 pt-32 sm:px-6 sm:pt-40">
        <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
          <p
            className="g-type-in g-spectrum text-[19px] font-semibold tracking-[-0.02em] sm:text-[21px]"
            style={{ animationDelay: "0ms" }}
          >
            Join UI
          </p>
          <h1
            id="hero-title"
            className="g-type-in mt-3 text-[clamp(3.25rem,9.4vw,6.75rem)] leading-[0.98] font-semibold tracking-[-0.05em] text-balance text-[#1d1d1f]"
            style={{ animationDelay: "80ms" }}
          >
            Made to move.
            <br />
            Yours to keep.
          </h1>
          <p
            className="g-type-in mt-6 max-w-[38rem] text-[19px] leading-[1.42] tracking-[-0.022em] text-pretty text-[#3a3a3e] sm:text-[21px] sm:leading-[1.38]"
            style={{ animationDelay: "200ms" }}
          >
            {count} motion-first React components. One command puts the source in your
            project — yours to read, change and ship.
          </p>
          <div
            className="g-type-in mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <Link href={g("/components")} className={pill("primary", "lg", "max-sm:h-11 max-sm:px-5 max-sm:text-[16px]")}>
              Browse components
            </Link>
            <Link href={g("/docs/installation")} className={pill("glass", "lg", "max-sm:h-11 max-sm:px-5 max-sm:text-[16px]")}>
              Get started
            </Link>
          </div>
          <p
            className="g-type-in mt-5 text-[14px] tracking-[-0.01em] text-[#56565b]"
            style={{ animationDelay: "360ms" }}
          >
            Free and open source under the MIT licence.
          </p>
        </div>

        <div className="mt-16 sm:mt-20">
          <HeroScene />
        </div>
      </section>

      {/* ── The lineup ───────────────────────────────────────────────── */}
      <section aria-labelledby="lineup-title" className="px-4 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-[1180px]">
          <Head
            id="lineup-title"
            eyebrow="The lineup"
            tone="text-[#0066cc]"
            title={
              <>
                {count} components.
                <br />
                All of them alive.
              </>
            }
          >
            Every tile is running the real thing — the same source the CLI puts in your
            project.
          </Head>

          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            {lineup.map((entry, index) => (
              <li
                key={entry.slug}
                className={cn(
                  "g-rise",
                  entry.span,
                  index === lineup.length - 1 && lineup.length % 2 === 1 && "md:col-span-2"
                )}
              >
                <ComponentTile
                  item={entry.item}
                  size={entry.size}
                  well={cn("aspect-[4/3] lg:aspect-auto", entry.well)}
                />
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-[17px] sm:text-[19px]">
            <Link href={g("/components")} className={textLink}>
              Browse the catalog
              <ChevronRight aria-hidden="true" className="size-[18px]" strokeWidth={2.25} />
            </Link>
          </p>
        </div>
      </section>

      {/* ── Install ──────────────────────────────────────────────────── */}
      <section aria-labelledby="install-title" className="px-4 pt-32 sm:px-6 sm:pt-44">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="g-rise">
            <Head
              id="install-title"
              eyebrow="Install"
              tone="text-[#0a7d5a]"
              align="start"
              title={
                <>
                  One command.
                  <br />
                  Real files.
                </>
              }
            >
              Join UI is a shadcn registry. The CLI resolves the dependencies, writes the
              source into <span className="font-mono text-[0.88em]">{siteConfig.installTarget}</span>{" "}
              and leaves the rest of your project alone. No wrapper package, nothing to
              upgrade around.
            </Head>
            <div className="mt-7 flex flex-col items-start gap-2.5 text-[17px]">
              <Link href={g("/docs/registry-setup")} className={textLink}>
                Set up the {siteConfig.namespace} registry
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
              </Link>
              <Link href={g("/docs/installation")} className={textLink}>
                Read the installation guide
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
              </Link>
            </div>
          </div>

          <div className="g-lift min-w-0">
            <InstallDemo items={installItems} />
          </div>
        </div>
      </section>

      {/* ── For agents ───────────────────────────────────────────────── */}
      <section aria-labelledby="agents-title" className="px-4 pt-32 sm:px-6 sm:pt-44">
        <div className="mx-auto max-w-[1180px]">
          <Head
            id="agents-title"
            eyebrow="For AI coding agents"
            tone="text-[#7a3cc6]"
            title={
              <>
                Brief your agent
                <br />
                in one click.
              </>
            }
          >
            Every component page has Copy prompt. It hands Claude Code, Cursor or Codex
            the stack, the install path, every prop, the accessibility rules and the full
            source — built from the same metadata as the page, so it never describes a
            prop that does not exist.
          </Head>

          {promptComponent ? (
            <div className="g-lift mx-auto mt-14 max-w-[880px]">
              <div className="g-glass g-thick overflow-hidden rounded-[34px] p-2.5">
                <div className="flex flex-wrap items-center gap-3 px-4 pt-2 pb-3 sm:px-5">
                  <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#3a3a3e]">
                    {promptComponent.slug}.prompt.txt
                  </p>
                  <GlassCopy
                    value={prompt}
                    kind="prompt"
                    idle="Copy prompt"
                    toastMessage={`${promptComponent.title} prompt copied`}
                    tone="primary"
                    size="sm"
                  />
                </div>
                <div className="g-inset relative overflow-hidden rounded-[24px]">
                  <pre className="max-h-[380px] overflow-hidden px-5 py-5 font-mono text-[12.5px] leading-[1.7] whitespace-pre-wrap text-[#3a3a3e] sm:px-7 sm:text-[13px]">
                    {promptExcerpt}
                  </pre>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/95 via-white/70 to-transparent"
                  />
                </div>
              </div>
              <p className="mt-6 text-center text-[17px]">
                <Link href={g("/docs/ai")} className={textLink}>
                  How the prompt is built
                  <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Considerate by design ────────────────────────────────────── */}
      <section aria-labelledby="craft-title" className="px-4 pt-32 sm:px-6 sm:pt-44">
        <div className="mx-auto max-w-[1180px]">
          <Head
            id="craft-title"
            eyebrow="Built in"
            tone="text-[#c0185a]"
            title={
              <>
                Considerate
                <br />
                by design.
              </>
            }
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            <Fact className="lg:col-span-7" title="WCAG 2.2 AA, from the first commit.">
              <p
                aria-hidden="true"
                className="g-spectrum text-[clamp(6rem,14vw,10.5rem)] leading-[0.9] font-semibold tracking-[-0.06em]"
              >
                AA
              </p>
              <p className="mt-6 max-w-[34rem]">
                Keyboard paths, managed focus, live regions and spelled-out states ship
                inside every component — not in a later pass.
              </p>
              <Link href={g("/docs/accessibility")} className={cn(textLink, "mt-4")}>
                The accessibility baseline
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
              </Link>
            </Fact>

            <Fact className="lg:col-span-5" title="Still, when you ask.">
              <StillDemo />
              <p className="mt-6">
                Turn on Reduce Motion and every component settles into a complete,
                static layout. Nothing waits off screen to appear.
              </p>
            </Fact>

            <Fact className="lg:col-span-5" title="Open code. Yours.">
              <p
                aria-hidden="true"
                className="text-[clamp(4.5rem,9vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-[#1d1d1f]"
              >
                MIT
              </p>
              <p className="mt-6">
                The CLI writes plain files you can read, fork and change. No licence key,
                no runtime package to keep pace with.
              </p>
            </Fact>

            <Fact className="lg:col-span-7" title="Motion that stays cheap.">
              <p
                aria-hidden="true"
                className="font-mono text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15] tracking-[-0.04em] text-[#1d1d1f]"
              >
                transform
                <span className="text-[#86868b]"> · </span>
                opacity
              </p>
              <p className="mt-6 max-w-[34rem]">
                Animation stays on the two properties the compositor handles, listeners
                are scoped to the viewport, and every prop is typed under strict
                TypeScript.
              </p>
            </Fact>
          </div>
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section aria-labelledby="close-title" className="px-4 pt-32 sm:px-6 sm:pt-44">
        <div className="g-rise-scale g-glass g-thin mx-auto flex max-w-[1180px] flex-col items-center rounded-[44px] px-6 py-20 text-center sm:py-28">
          <h2
            id="close-title"
            className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[1] font-semibold tracking-[-0.048em] text-[#1d1d1f]"
          >
            Start with one.
          </h2>
          <p className="mt-5 max-w-[30rem] text-[19px] leading-[1.42] tracking-[-0.022em] text-[#3a3a3e] sm:text-[21px]">
            Pick a component, run one command, and make it yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={g("/components")} className={pill("primary", "lg", "max-sm:h-11 max-sm:px-5 max-sm:text-[16px]")}>
              Browse components
            </Link>
            <Link href={g("/docs")} className={pill("glass", "lg", "max-sm:h-11 max-sm:px-5 max-sm:text-[16px]")}>
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Head({
  id,
  eyebrow,
  tone,
  title,
  align = "center",
  children,
}: {
  id: string
  eyebrow: string
  tone: string
  title: React.ReactNode
  align?: "center" | "start"
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "g-rise flex flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      <p className={cn("text-[19px] font-semibold tracking-[-0.02em] sm:text-[21px]", tone)}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 text-[clamp(2.5rem,6.2vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-[#1d1d1f]"
      >
        {title}
      </h2>
      {children ? (
        <p
          className={cn(
            "mt-6 max-w-[40rem] text-[17px] leading-[1.47] tracking-[-0.016em] text-pretty text-[#3a3a3e] sm:text-[19px] sm:leading-[1.42]",
            align === "center" && "mx-auto"
          )}
        >
          {children}
        </p>
      ) : null}
    </div>
  )
}

function Fact({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <article
      className={cn(
        "g-rise g-glass g-flat flex flex-col rounded-[34px] p-8 text-[17px] leading-[1.47] tracking-[-0.016em] text-[#3a3a3e] sm:p-10",
        "[--g-fill:0.62]",
        className
      )}
    >
      <h3 className="mb-8 text-[24px] leading-[1.17] font-semibold tracking-[-0.026em] text-[#1d1d1f] sm:text-[28px]">
        {title}
      </h3>
      {children}
    </article>
  )
}
