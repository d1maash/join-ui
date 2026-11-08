import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileCode2, ListChecks, Sparkles } from "lucide-react"

import { CategoryArt } from "@/components/variants/studio/category-art"
import { getCategoryCounts, getItems, getWallTiles } from "@/components/variants/studio/data"
import { categoryHref, sh } from "@/components/variants/studio/href"
import { InstallBox } from "@/components/variants/studio/install-box"
import { PromptPanel } from "@/components/variants/studio/prompt-panel"
import { Wall } from "@/components/variants/studio/wall"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { getComponent } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Studio",
  description: "Join UI: accessible, motion-first React components you install as source with the shadcn CLI.",
  robots: { index: false, follow: false },
}

export default async function StudioHome() {
  const items = getItems()
  const newest = items[0]
  const categories = getCategoryCounts(items)
  const tiles = getWallTiles()

  const promptSubject = newest ? getComponent(newest.slug) : undefined
  const prompt = promptSubject
    ? buildComponentPrompt({
        component: promptSubject,
        sources: await getComponentSources(promptSubject),
      })
    : null

  const installOptions = [...items]
    .filter((item) => item.key === item.slug)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((item) => ({ slug: item.slug, title: item.title }))

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 pt-16 pb-16 text-center md:px-6 md:pt-24 md:pb-20">
        {newest ? (
          <Link
            href={newest.href}
            className={cn(
              "group inline-flex h-7 items-center gap-2 rounded-full border border-border bg-background py-1 pr-2.5 pl-1 text-[12.5px]",
              "transition-colors hover:border-border-hover hover:bg-subtle",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
          >
            <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[11px] font-semibold text-positive">
              New
            </span>
            <span className="font-medium">{newest.title}</span>
            <span className="hidden text-muted-foreground sm:inline">· {newest.category}</span>
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}

        <h1 className="mt-6 text-[clamp(2.5rem,6.2vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.042em] text-balance">
          Components that move,
          <br className="hidden sm:block" /> in code you own.
        </h1>
        <p className="mt-5 max-w-[40rem] text-[clamp(1rem,1.6vw,1.125rem)] leading-relaxed text-pretty text-muted-foreground">
          Accessible, motion-first React components for Next.js. Install one as a file you own
          with the shadcn CLI, or hand its ready-made prompt to your coding agent.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href={sh("/components")}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Browse components
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={sh("/docs")}
            className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Read the docs
          </Link>
        </div>

        {newest ? (
          <InstallBox options={installOptions} defaultSlug={newest.slug} className="mt-10 w-full max-w-[34rem]" />
        ) : null}

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
          {["shadcn registry", "Motion", "WCAG 2.2 AA", "Reduced-motion fallbacks", "MIT"].map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1 rounded-full bg-border-strong" />
              {fact}
            </li>
          ))}
        </ul>
      </section>

      {/* The wall */}
      <section aria-labelledby="st-wall" className="mx-auto w-full max-w-[1400px] px-4 pb-24 md:px-6">
        <SectionHead
          id="st-wall"
          title="See them run"
          description="Each tile mounts the real component as it scrolls into view — no screenshots, no recordings."
          link={{ href: sh("/components"), label: "All components" }}
        />
        <Wall tiles={tiles} total={items.length} categories={categories} />
      </section>

      {/* Categories */}
      <section aria-labelledby="st-categories" className="border-t border-border bg-subtle">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-20 md:px-6">
          <SectionHead
            id="st-categories"
            title="Browse by category"
            description="Every component lives in exactly one category. Pick a shelf."
            link={{ href: sh("/components"), label: "Open the catalog" }}
          />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={categoryHref(category.name)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border border-border bg-background",
                    "transition-[border-color,box-shadow] duration-200 hover:border-border-hover hover:shadow-sm",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  )}
                >
                  <CategoryArt
                    category={category.name}
                    className="aspect-[16/10] border-b border-border bg-[var(--st-stage)] transition-transform duration-300 [&>*]:transition-transform [&>*]:duration-300 group-hover:[&>*]:scale-[1.04]"
                  />
                  <span className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="truncate text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {category.count} {category.count === 1 ? "component" : "components"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Agent */}
      {prompt && promptSubject ? (
        <section aria-labelledby="st-agent" className="border-t border-border">
          <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-4 py-20 md:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-24">
            <div>
              <h2
                id="st-agent"
                className="text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] font-semibold tracking-[-0.035em]"
              >
                Made for your agent
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
                Every component page has a Copy prompt button. It copies a complete brief — what to
                build, where the file goes, every prop, the accessibility rules and the full source
                — ready to paste into a coding agent.
              </p>
              <ul className="mt-8 flex flex-col gap-5">
                {[
                  {
                    icon: FileCode2,
                    title: "Generated, not written",
                    body: "Built from the same metadata as the props table and the exact file the CLI installs, so it cannot describe a prop that does not exist.",
                  },
                  {
                    icon: ListChecks,
                    title: "Rules that survive the edit",
                    body: "ARIA attributes, the keyboard map and the reduced-motion behaviour are spelled out as requirements, not left to chance.",
                  },
                  {
                    icon: Sparkles,
                    title: "One paste, any agent",
                    body: "Claude Code, Cursor, Codex — or skip the prompt and run the shadcn CLI yourself.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={sh("/docs/ai")}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                How the prompt is built
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
            <div>
              <PromptPanel prompt={prompt} slug={promptSubject.slug} title={promptSubject.title} />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                An excerpt of the real prompt for{" "}
                <Link href={sh(`/components/${promptSubject.slug}`)} className="font-medium text-foreground hover:underline">
                  {promptSubject.title}
                </Link>
                . The copy button takes all of it.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function SectionHead({
  id,
  title,
  description,
  link,
}: {
  id: string
  title: string
  description: string
  link: { href: string; label: string }
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div>
        <h2 id={id} className="text-[clamp(1.5rem,2.4vw,1.875rem)] leading-tight font-semibold tracking-[-0.03em]">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-pretty text-muted-foreground">{description}</p>
      </div>
      <Link
        href={link.href}
        className="group inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {link.label}
        <ArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>
    </div>
  )
}
