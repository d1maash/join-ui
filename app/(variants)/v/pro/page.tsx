import type * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { Chapters } from "@/components/variants/pro/chapters"
import { getChapters } from "@/components/variants/pro/chapters-data"
import { CommandBox } from "@/components/variants/pro/command"
import { CopyPromptPill, PromptProvider } from "@/components/variants/pro/copy"
import { HeroStage } from "@/components/variants/pro/hero-stage"
import { proHref } from "@/components/variants/pro/href"
import { Reveal } from "@/components/variants/pro/reveal"
import { pillClass, textLinkClass, type } from "@/components/variants/pro/styles"
import { CarbonCopy } from "@/registry/components/carbon-copy"
import { shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { getComponent, getRegistryStats } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: { absolute: "Join UI — Copy the code. Own the code." },
  description: siteConfig.description,
}

/*
 * The landing page, as an apple.com product page.
 * ---------------------------------------------------------------------------
 * Five screens, one idea each: the product lit on a stage; a closer look at
 * every component, live; why it is built to be owned; the one command that
 * installs it; and the way out. The original's facts strip, featured and
 * "recently added" rows, category strip, six-principle sheet and three-link
 * close are gone — with seven components, featured, recent and "all" were the
 * same seven cards three times, and the principles now prove themselves in
 * the tiles and on the stage instead of in paragraphs.
 */
export default async function ProHome() {
  const stats = getRegistryStats()
  const chapters = getChapters()

  // The prompt shown in the agents tile is the real one, built the same way
  // every component page builds its own.
  const featured = getComponent("approval-gate") ?? undefined
  const sources = featured ? await getComponentSources(featured) : []
  const prompt = featured ? buildComponentPrompt({ component: featured, sources }) : ""
  const promptHead = prompt.split("\n").slice(0, 22).join("\n")

  const installTarget = `${siteConfig.namespace}/${featured?.slug ?? "<component>"}`

  return (
    <main id="main-content" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="hero-title"
        className="relative pt-14 pb-20 sm:pt-20 lg:pb-24"
      >
        <div
          aria-hidden="true"
          className="pro-spotlight pointer-events-none absolute inset-x-0 top-0 h-[1100px]"
        />
        <div className="relative mx-auto max-w-[1100px] px-6 text-center">
          <p className={cn(type.eyebrow, "pro-ember inline-block")}>Join UI</p>
          <CarbonCopy
            id="hero-title"
            as="h1"
            trigger="mount"
            lines={["Copy the code.", "Own the code."]}
            className={cn(type.hero, "mt-3 text-[#f5f5f7]")}
          />
          <p
            className={cn(
              type.intro,
              "mx-auto mt-7 max-w-[38rem] font-semibold text-[#86868b]"
            )}
          >
            Seven motion-first React components for agent interfaces and product pages.{" "}
            <span className="text-[#f5f5f7]">
              Installed as source, yours from the first line.
            </span>
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Link href={proHref("/components")} className={pillClass("primary")}>
              Browse components
            </Link>
            <Link href={proHref("/docs")} className={cn(textLinkClass, "text-[17px]")}>
              Get started
              <span aria-hidden="true" className="ml-0.5">
                ›
              </span>
            </Link>
          </div>
        </div>

        <div className="relative mt-20 px-4 sm:mt-24 sm:px-6">
          <HeroStage />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* A closer look                                                     */}
      {/* ---------------------------------------------------------------- */}
      {chapters.length > 0 ? (
        <section aria-labelledby="closer-title" className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-[1280px]">
            <Reveal className="max-w-[46rem]">
              <h2 id="closer-title" className={cn(type.display, "text-[#f5f5f7]")}>
                Take a closer look.
              </h2>
              <p className={cn(type.intro, "mt-5 text-[#86868b]")}>
                {chapters.length === 7 ? "Seven" : chapters.length} components, every
                one running live on this page.{" "}
                <span className="text-[#f5f5f7]">Not a screenshot in sight.</span>
              </p>
            </Reveal>
            <div className="mt-16 lg:mt-8">
              <Chapters chapters={chapters} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Built to be yours                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="yours-title" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="px-2 text-center">
            <h2 id="yours-title" className={cn(type.display, "text-[#f5f5f7]")}>
              Built to be <span className="pro-titanium">yours.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:mt-20 md:grid-cols-6 lg:gap-5">
            {/* For agents — the real prompt, copyable. */}
            {featured ? (
              <Reveal
                as="article"
                className="pro-tile-hairline relative flex flex-col overflow-hidden rounded-[30px] bg-[#161617] md:col-span-6 lg:col-span-4 lg:row-span-2"
              >
                <div className="px-8 pt-10 sm:px-11 sm:pt-12">
                  <p className={cn(type.eyebrow, "pro-ember inline-block")}>
                    For coding agents
                  </p>
                  <h3 className={cn(type.title, "mt-2 max-w-[22ch] text-[#f5f5f7]")}>
                    One click briefs your agent.
                  </h3>
                  <p className={cn(type.body, "mt-4 max-w-[36rem] text-[#86868b]")}>
                    Every component ships a ready-made prompt: the stack, the install
                    path, every prop, the accessibility rules and the complete source.
                    Paste it into Cursor, Claude Code or Codex.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <PromptProvider prompt={prompt} name={featured.title}>
                      <CopyPromptPill label={`Copy the ${featured.title} prompt`} />
                    </PromptProvider>
                    <Link
                      href={proHref("/docs/ai")}
                      className={cn(textLinkClass, "text-[17px]")}
                    >
                      How it’s built
                      <span aria-hidden="true" className="ml-0.5">
                        ›
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="relative mt-10 flex-1 px-5 sm:px-11">
                  <div className="h-full min-h-[300px] overflow-hidden rounded-t-[18px] bg-[#0b0b0c] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]">
                    <p className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-5 font-mono text-[12px] text-[#86868b]">
                      {featured.slug}.prompt.txt
                    </p>
                    <pre
                      aria-label={`The first lines of the ${featured.title} prompt`}
                      className="pro-code-clip max-h-[420px] overflow-hidden px-5 py-4 font-mono text-[12.5px] leading-[1.7] whitespace-pre-wrap text-[#a1a1a6]"
                    >
                      {promptHead}
                    </pre>
                  </div>
                </div>
              </Reveal>
            ) : null}

            <StatTile
              className="md:col-span-3 lg:col-span-2"
              figure={String(stats.total)}
              delay={80}
            >
              components. Each one finished, documented and running live.
            </StatTile>

            <StatTile className="md:col-span-3 lg:col-span-2" figure="MIT" delay={160}>
              Real files in{" "}
              <code className="font-mono text-[0.9em] text-[#f5f5f7]">
                {siteConfig.installTarget}
              </code>
              . Read them, change them, keep them.
            </StatTile>

            <StatTile className="md:col-span-2" figure="AA">
              WCAG 2.2 AA is the baseline. Keyboard paths, visible focus and live
              regions come built in.
            </StatTile>

            <Reveal
              as="article"
              delay={80}
              className="pro-tile-hairline flex flex-col justify-between gap-10 rounded-[30px] bg-[#161617] p-8 sm:p-10 md:col-span-2"
            >
              <div
                aria-hidden="true"
                className="flex items-center justify-between rounded-[14px] bg-[#232325] px-4 py-3"
              >
                <span className="text-[15px] text-[#f5f5f7]">Reduce Motion</span>
                <span className="relative h-[31px] w-[51px] rounded-full bg-[#30d158]">
                  <span className="absolute top-[2px] right-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.25)]" />
                </span>
              </div>
              <div>
                <h3 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.025em] text-[#f5f5f7]">
                  Motion that listens.
                </h3>
                <p className={cn(type.body, "mt-3 text-[#86868b]")}>
                  Turn on Reduce Motion and every component lands complete and still.
                </p>
              </div>
            </Reveal>

            <StatTile
              className="md:col-span-2"
              figure={siteConfig.namespace}
              delay={160}
              small
            >
              A real shadcn registry. Install by name, or straight from a URL.
            </StatTile>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* One command                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="install-title"
        className="relative overflow-hidden px-6 py-28 text-center sm:py-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-[640px] -translate-y-1/2 bg-[radial-gradient(45%_50%_at_50%_50%,rgb(0_113_227/0.16)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-[1000px]">
          <Reveal>
            <p className={cn(type.eyebrow, "text-[#86868b]")}>Installation</p>
            <h2 id="install-title" className={cn(type.display, "mt-2 text-[#f5f5f7]")}>
              One command.
            </h2>
            <p className={cn(type.intro, "mx-auto mt-6 max-w-[40rem] text-[#86868b]")}>
              Add the <span className="text-[#f5f5f7]">{siteConfig.namespace}</span>{" "}
              namespace to <span className="text-[#f5f5f7]">components.json</span> once.
              Then every component is a single line away — dependencies resolved, source
              written into your repo.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-14">
            <CommandBox
              appearance="hero"
              commands={shadcnCommands(installTarget)}
              label="Install a component"
            />
          </Reveal>
          <Reveal
            delay={200}
            className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3"
          >
            <Link
              href={proHref("/docs/registry-setup")}
              className={cn(textLinkClass, "text-[17px]")}
            >
              Registry setup
              <span aria-hidden="true" className="ml-0.5">
                ›
              </span>
            </Link>
            <Link
              href={proHref("/docs/installation")}
              className={cn(textLinkClass, "text-[17px]")}
            >
              Installation guide
              <span aria-hidden="true" className="ml-0.5">
                ›
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Close                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="close-title"
        className="px-6 pt-12 pb-36 text-center sm:pb-44"
      >
        <Reveal className="mx-auto max-w-[900px]">
          <h2 id="close-title" className={cn(type.display, "text-[#f5f5f7]")}>
            Pick one. <span className="pro-titanium">Make it yours.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Link href={proHref("/components")} className={pillClass("primary", "lg")}>
              Browse components
            </Link>
            <Link href={proHref("/docs")} className={cn(textLinkClass, "text-[17px]")}>
              Read the docs
              <span aria-hidden="true" className="ml-0.5">
                ›
              </span>
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  )
}

function StatTile({
  figure,
  children,
  className,
  delay,
  small = false,
}: {
  figure: string
  children: React.ReactNode
  className?: string
  delay?: number
  small?: boolean
}) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className={cn(
        "pro-tile-hairline flex flex-col justify-between gap-8 rounded-[30px] bg-[#161617] p-8 sm:p-10",
        className
      )}
    >
      <p
        className={cn(
          "pro-titanium pro-numeral leading-[0.95] font-semibold",
          small
            ? "text-[clamp(2.5rem,4.4vw,3.5rem)] tracking-[-0.045em]"
            : "text-[clamp(4.5rem,8vw,7rem)] tracking-[-0.055em]"
        )}
      >
        {figure}
      </p>
      <p className="text-[19px] leading-[1.35] font-semibold tracking-[-0.022em] text-[#86868b]">
        {children}
      </p>
    </Reveal>
  )
}
