import type * as React from "react"
import type { Metadata } from "next"

import { AirCode } from "@/components/variants/air/code"
import { AirCommand } from "@/components/variants/air/command"
import { GetToKnow, KnowBlock, type KnowCard } from "@/components/variants/air/get-to-know"
import { air } from "@/components/variants/air/href"
import {
  KeyboardArt,
  MotionArt,
  OpenCodeArt,
  PromptArt,
  TypesArt,
} from "@/components/variants/air/know-art"
import { MoreLink, PillLink } from "@/components/variants/air/pill"
import { Reveal } from "@/components/variants/air/reveal"
import {
  AgentHiveScene,
  ApprovalGateScene,
  FocusStackScene,
  StatusTimelineScene,
  ToolTraceScene,
} from "@/components/variants/air/scenes"
import { AirThumb } from "@/components/variants/air/thumb"
import { shadcnCommands } from "@/lib/commands"
import { getComponent, getRegistryStats } from "@/lib/registry"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import { CarbonCopy } from "@/registry/components/carbon-copy"

export const metadata: Metadata = {
  description: siteConfig.description,
}

/*
 * The landing page, as apple.com's home page is built: one product per band,
 * each band a name, one line, two pills and the product itself — here a live
 * component rather than a photograph. Then a grid of smaller tiles, the
 * "Get to know" shelf, and the one command it all comes down to.
 *
 * Gone from the original: the facts strip, the featured and recently-added
 * card grids (every component now has a tile of its own), the six-cell
 * principles sheet (now the shelf, where each idea gets a whole card and a
 * sheet to explain itself), the prompt listing (inside the AI card) and the
 * "Next" rows (the footer already is that directory).
 */
const NUMBERS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]

function count(total: number) {
  return NUMBERS[total] ?? String(total)
}

export default function AirHome() {
  const stats = getRegistryStats()

  return (
    <main id="main-content" className="overflow-x-clip">
      <Hero total={stats.total} />

      <BigTile
        slug="agent-hive"
        tagline="Pick a model. Send it to work."
        tone="band"
        scene={<AgentHiveScene />}
      />

      <BigTile
        slug="tool-trace"
        tagline="Every tool call, as it happens."
        tone="dark"
        scene={<ToolTraceScene />}
      />

      <section aria-label="More components" className="bg-white p-3">
        <ul className="grid gap-3 lg:grid-cols-2">
          <GridTile
            slug="approval-gate"
            tagline="Nothing runs until you say so."
            scene={<ApprovalGateScene />}
          />
          <GridTile
            slug="status-timeline"
            tagline="Every step, in its place."
            scene={<StatusTimelineScene />}
          />
          <GridTile
            slug="focus-stack"
            tagline="One thing at a time."
            scene={<FocusStackScene />}
          />
          <GridTile
            slug="glass-crest"
            tagline="A hero section, in glass."
            scene={<AirThumb slug="glass-crest" className="h-[20rem] w-full max-w-[36rem]" />}
          />
        </ul>
      </section>

      <KnowShelf />

      <Install />
    </main>
  )
}

/* ------------------------------------------------------------------------ */

function Hero({ total }: { total: number }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="bg-white px-5 pt-16 pb-20 text-center sm:pt-24 sm:pb-28"
    >
      <p className="air-rise air-eyebrow text-[#1d1d1f]">Join UI</p>
      {/*
        The headline is the first component on the page. Carbon Copy sets the
        first line, then peels the second off it with the changed word turning
        over — and resolves to the finished pair under reduced motion.
      */}
      <CarbonCopy
        id="hero-title"
        as="h1"
        trigger="mount"
        lines={["Copy the code.", "Keep the code."]}
        className="air-hero mx-auto mt-4 text-[#1d1d1f]"
      />
      <p
        className="air-rise air-sub mx-auto mt-7 max-w-[32ch] text-balance text-[#6e6e73]"
        style={{ ["--air-delay" as string]: "1150ms" }}
      >
        {count(total)} motion-first React components. One command to install. Every line
        yours to change.
      </p>
      <div
        className="air-rise mt-9 flex flex-wrap justify-center gap-3.5"
        style={{ ["--air-delay" as string]: "1300ms" }}
      >
        <PillLink href={air("/components")} size="lg">
          Browse components
        </PillLink>
        <PillLink href={air("/docs")} variant="secondary" size="lg">
          Get started
        </PillLink>
      </div>
      <p
        className="air-rise mt-7 text-[17px]"
        style={{ ["--air-delay" as string]: "1450ms" }}
      >
        <MoreLink href={air("/components/carbon-copy")}>
          This headline is Carbon Copy
        </MoreLink>
      </p>
    </section>
  )
}

/* ------------------------------------------------------------------------ */

function TileActions({
  slug,
  title,
  tone,
  size,
}: {
  slug: string
  title: string
  tone: "light" | "dark"
  size: "lg" | "md"
}) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3.5">
      <PillLink href={air(`/components/${slug}`)} size={size}>
        Learn more<span className="sr-only"> about {title}</span>
      </PillLink>
      <PillLink
        href={air(`/components/${slug}#install`)}
        variant={tone === "dark" ? "onDark" : "secondary"}
        size={size}
      >
        Install<span className="sr-only"> {title}</span>
      </PillLink>
    </div>
  )
}

function BigTile({
  slug,
  tagline,
  tone,
  scene,
}: {
  slug: string
  tagline: string
  tone: "band" | "dark" | "white"
  scene: React.ReactNode
}) {
  const component = getComponent(slug)
  if (!component) return null
  const dark = tone === "dark"

  return (
    <section
      aria-labelledby={`${slug}-tile`}
      className={cn(
        "overflow-hidden px-5 pt-16 pb-20 text-center sm:pt-20 sm:pb-24",
        tone === "band" && "bg-[#f5f5f7] text-[#1d1d1f]",
        tone === "white" && "bg-white text-[#1d1d1f]",
        dark && "dark bg-black text-[#f5f5f7]"
      )}
    >
      <Reveal>
        <h2 id={`${slug}-tile`} className="air-h1">
          {component.title}
        </h2>
        <p className={cn("air-sub mt-3", dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]")}>
          {tagline}
        </p>
        <TileActions slug={slug} title={component.title} tone={dark ? "dark" : "light"} size="md" />
      </Reveal>
      <Reveal delay={120} className="mx-auto mt-12 flex max-w-[64rem] justify-center sm:mt-16">
        {scene}
      </Reveal>
    </section>
  )
}

function GridTile({
  slug,
  tagline,
  scene,
}: {
  slug: string
  tagline: string
  scene: React.ReactNode
}) {
  const component = getComponent(slug)
  if (!component) return null

  return (
    <li className="flex">
      <section
        aria-labelledby={`${slug}-tile`}
        className="flex min-h-[38rem] w-full flex-col items-center overflow-hidden rounded-[28px] bg-[#f5f5f7] px-6 pt-12 text-center sm:min-h-[42rem] sm:pt-14"
      >
        <Reveal>
          <h2 id={`${slug}-tile`} className="air-h3">
            {component.title}
          </h2>
          <p className="mt-2 text-[19px] leading-[1.3] tracking-[-0.014em] text-[#1d1d1f] sm:text-[21px]">
            {tagline}
          </p>
          <TileActions slug={slug} title={component.title} tone="light" size="md" />
        </Reveal>
        <Reveal
          delay={120}
          className="flex w-full flex-1 items-center justify-center pt-10 pb-12"
        >
          {scene}
        </Reveal>
      </section>
    </li>
  )
}

/* ------------------------------------------------------------------------ */

function KnowShelf() {
  const cards: KnowCard[] = [
    {
      id: "open-code",
      eyebrow: "Open code",
      title: "Yours from the first line.",
      art: <OpenCodeArt />,
      detail: (
        <div className="flex flex-col gap-4">
          <KnowBlock lead="The CLI writes real files.">
            Each component lands in{" "}
            <code className="font-mono text-[0.85em] text-[#1d1d1f]">
              {siteConfig.installTarget}
            </code>{" "}
            as one typed React file. There is no wrapper package to upgrade and no
            theme API to fight when your design moves on.
          </KnowBlock>
          <KnowBlock lead="Read it. Change it. Delete what you don’t need.">
            The source on every component page is exactly the file the CLI installs, so
            what you preview is what you own.
          </KnowBlock>
          <p className="mt-4 text-[17px]">
            <MoreLink href={air("/docs/installation")}>Read the installation guide</MoreLink>
          </p>
        </div>
      ),
    },
    {
      id: "prompt",
      eyebrow: "For AI agents",
      title: "One prompt. The whole component.",
      tone: "dark",
      art: <PromptArt />,
      detail: (
        <div className="flex flex-col gap-4">
          <KnowBlock
            lead="A brief, not a guess."
            aside={
              <AirCode
                language="text"
                title="status-timeline.prompt.txt"
                tone="white"
                code={`Add the <StatusTimeline> component to my existing Next.js application.

Project stack:
- Next.js (App Router)
- React 19 with Server Components
- TypeScript in strict mode
- Tailwind CSS v4 with CSS-variable design tokens

Requirements:
- Install all required dependencies.
- Place the component at components/joinui/status-timeline.tsx.
- Respect \`prefers-reduced-motion: reduce\`.
- Do not modify unrelated files.`}
              />
            }
          >
            Every component page has a Copy prompt button. It hands Cursor, Claude Code,
            Codex or any other agent the stack, the install path, the dependencies, every
            prop, the accessibility and motion rules, and the complete source.
          </KnowBlock>
          <KnowBlock lead="Generated, so it can’t drift.">
            The prompt is built from the same metadata as the page it sits on. It cannot
            describe a prop that does not exist.
          </KnowBlock>
          <p className="mt-4 text-[17px]">
            <MoreLink href={air("/docs/ai")}>How the prompt is built</MoreLink>
          </p>
        </div>
      ),
    },
    {
      id: "access",
      eyebrow: "Accessibility",
      title: "Every path works from the keyboard.",
      art: <KeyboardArt />,
      detail: (
        <div className="flex flex-col gap-4">
          <KnowBlock lead="WCAG 2.2 AA is the baseline.">
            Keyboard paths, focus management and live regions are part of each component
            from the start, not a pass at the end.
          </KnowBlock>
          <KnowBlock lead="Real semantics.">
            Buttons are buttons and lists are lists. State is never carried by colour
            alone — every hue has a glyph and a label beside it.
          </KnowBlock>
          <KnowBlock lead="Focus you can see.">
            A clear outline on every control, never removed — only replaced with something
            at least as visible.
          </KnowBlock>
          <p className="mt-4 text-[17px]">
            <MoreLink href={air("/docs/accessibility")}>Read the accessibility guide</MoreLink>
          </p>
        </div>
      ),
    },
    {
      id: "motion",
      eyebrow: "Motion",
      title: "Moves with purpose. Rests on request.",
      art: <MotionArt />,
      detail: (
        <div className="flex flex-col gap-4">
          <KnowBlock lead="Transform and opacity, and nothing else.">
            Animations stay on the compositor, listeners are scoped to the viewport, and
            nothing loops at rest unless that is the point of the component.
          </KnowBlock>
          <KnowBlock lead="Reduce Motion is a first-class state.">
            Turn it on and every component settles into a complete, still layout. Nothing
            is hidden and no capability is lost.
          </KnowBlock>
          <p className="mt-4 text-[17px]">
            <MoreLink href={air("/docs/accessibility#motion")}>How motion degrades</MoreLink>
          </p>
        </div>
      ),
    },
    {
      id: "types",
      eyebrow: "TypeScript",
      title: "Strict, typed, no surprises.",
      tone: "dark",
      art: <TypesArt />,
      detail: (
        <div className="flex flex-col gap-4">
          <KnowBlock lead="Typed end to end.">
            Every component is strict TypeScript and exports its prop types. No{" "}
            <code className="font-mono text-[0.85em] text-[#1d1d1f]">any</code>, no
            ambient globals, no build-time surprises.
          </KnowBlock>
          <KnowBlock lead="Checked before it ships.">
            A component reaches the registry only after the registry validator, a strict
            typecheck and lint have all passed.
          </KnowBlock>
          <p className="mt-4 text-[17px]">
            <MoreLink href={air("/docs/contributing")}>See what a component needs</MoreLink>
          </p>
        </div>
      ),
    },
  ]

  return (
    <section aria-labelledby="know-title" className="bg-[#f5f5f7] pt-20 pb-16 sm:pt-28">
      <Reveal className="mx-auto mb-8 max-w-[75rem] px-5 sm:mb-10">
        <h2 id="know-title" className="air-shelf-title text-[#1d1d1f]">
          Get to know Join UI. <span>Built like the tools you already trust.</span>
        </h2>
      </Reveal>
      <Reveal delay={100}>
        <GetToKnow label="Get to know Join UI" cards={cards} />
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------------ */

function Install() {
  return (
    <section
      aria-labelledby="install-title"
      className="bg-white px-5 pt-24 pb-28 text-center sm:pt-32 sm:pb-36"
    >
      <Reveal>
        <h2 id="install-title" className="air-h1 mx-auto max-w-[14ch] text-balance">
          One command. Real files.
        </h2>
        <p className="air-sub mx-auto mt-5 max-w-[30ch] text-balance text-[#6e6e73]">
          Add the {siteConfig.namespace} namespace once. Then install any component by
          name.
        </p>
      </Reveal>
      <Reveal delay={120} className="mx-auto mt-12 max-w-[38rem]">
        <AirCommand
          commands={shadcnCommands(`${siteConfig.namespace}/status-timeline`)}
          tone="white"
          label="Package manager for the install command"
        />
      </Reveal>
      <Reveal
        delay={200}
        className="mt-9 flex flex-col items-center justify-center gap-3 text-[17px] sm:flex-row sm:gap-9"
      >
        <MoreLink href={air("/docs/registry-setup")}>Set up the registry</MoreLink>
        <MoreLink href={air("/docs/installation")}>Read the installation guide</MoreLink>
        <MoreLink href={siteConfig.links.github} external>
          View on GitHub
        </MoreLink>
      </Reveal>
    </section>
  )
}
