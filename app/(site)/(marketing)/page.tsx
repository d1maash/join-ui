import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ComponentCard } from "@/components/site/component-card"
import { Masthead, type MastheadFact } from "@/components/site/masthead"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Reveal } from "@/components/site/reveal"
import { Button } from "@/components/ui/button"
import { shadcnCommands } from "@/lib/commands"
import {
  getCategorySummaries,
  getFeaturedComponents,
  getLatestComponents,
  getRegistryStats,
} from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { revealAt } from "@/lib/reveal"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  // No `title` — the root layout's `title.default` already reads
  // "Join UI — <tagline>", and setting one here would run it through the
  // "%s — Join UI" template and repeat the site name.
  description: siteConfig.description,
  alternates: { canonical: "/" },
}

/**
 * The six rules, each with the thing that proves it.
 *
 * `proof` is the point of the redesign below. A principle is a claim, and six
 * claims set in six identical cards is a slogan wall — the reader has no way to
 * tell "WCAG 2.2 AA as the baseline" from the same sentence on a site that does
 * not mean it. So every rule carries the artefact it cashes out as: the path the
 * files land at, the two properties the animations are allowed to touch, the
 * command that has to pass. They are written in mono because each one is a
 * string a machine would also have to read, which is the site's rule for that
 * family, and because a claim next to its own evidence reads as a
 * specification rather than as marketing.
 */
const PRINCIPLES = [
  {
    title: "Open code, not a black box",
    description:
      "The CLI writes real files into your repository. Read them, edit them, delete the parts you do not need — there is no wrapper package to fight.",
    proof: `${siteConfig.installTarget}/*.tsx`,
  },
  {
    title: "One click to an AI-ready prompt",
    description:
      "Every component page ships a structured prompt with props, accessibility rules and the full source, generated from the same metadata that builds the page.",
    proof: "Copy prompt → prompt.txt",
  },
  {
    title: "WCAG 2.2 AA as the baseline",
    description:
      "Keyboard paths, focus management, live regions and reduced-motion fallbacks are part of each component, not a later pass.",
    proof: ":focus-visible · aria-live",
  },
  {
    title: "Animation that stays cheap",
    description:
      "Transform and opacity only, listeners scoped to the viewport, and every effect degrading to a static state when motion is turned down.",
    proof: "transform · opacity",
  },
  {
    title: "A real shadcn registry",
    description:
      "Namespaced items, resolved dependencies and validated schemas — installable by name or by URL, from any project.",
    proof: `${siteConfig.namespace}/<component>`,
  },
  {
    title: "Typed end to end",
    description:
      "Strict TypeScript with exported prop types. No `any`, no ambient globals, no build-time surprises.",
    proof: "tsc --noEmit",
  },
]

/**
 * The three directions out of this page.
 *
 * Deliberately not the install links — those already have a section of their
 * own further up, and repeating them at the bottom would be the page arguing
 * with someone who has finished reading it.
 */
const NEXT = [
  {
    href: "/components",
    title: "Browse the catalog",
    description:
      "Every component with a live preview, its props, and the source the CLI installs.",
  },
  {
    href: "/docs",
    title: "Read the documentation",
    description:
      "Setup, theming, accessibility and the prompt format, from the same metadata as the registry.",
  },
  {
    href: "/docs/contributing",
    title: "Add a component",
    description:
      "What a registry entry needs, and how a new component reaches every surface of this site.",
  },
]

const pad = (value: number) => String(value).padStart(2, "0")

/**
 * How many places in a section's entrance its header takes before the content
 * starts: the eyebrow, the heading, then the prose and the content together.
 * A grid of cards numbers itself on from here, so the first card follows the
 * caption rather than racing it.
 */
const HEADER_PLACES = 3

export default function HomePage() {
  const stats = getRegistryStats()
  const featured = getFeaturedComponents(4)
  const categories = getCategorySummaries().filter((category) => category.count > 0)
  const heroInstall = shadcnCommands(`${siteConfig.namespace}/<component>`)
  const empty = stats.total === 0

  /*
   * "Recently added" is only worth a section when it is actually showing
   * something the reader has not just scrolled past. While the registry is
   * small every component is both featured and recent, and running the same
   * three cards twice down one page made the catalog look padded — so the
   * latest list is drawn from what the featured row did not already take, and
   * disappears entirely when that leaves nothing.
   */
  const featuredSlugs = new Set(featured.map((component) => component.slug))
  const latest = getLatestComponents(8)
    .filter((component) => !featuredSlugs.has(component.slug))
    .slice(0, 3)

  const facts: MastheadFact[] = [
    { label: "Components", value: pad(stats.total) },
    {
      label: stats.categories === 1 ? "Category" : "Categories",
      value: pad(stats.categories),
    },
    { label: "WCAG 2.2", value: "AA" },
    { label: "Licence", value: "MIT" },
  ]

  return (
    <main id="main-content">
      <Masthead facts={facts} />

      <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
        {empty ? (
          <Section
            id="empty"
            eyebrow="Status"
            title="The registry is being rebuilt"
            aside={
              <p className="leading-relaxed text-pretty text-muted-foreground">
                No components are published right now. The registry pipeline, the
                documentation, the search index and the installable JSON endpoints
                are all in place and wired to a single metadata file — the first
                component added to{" "}
                <code className="rounded-sm border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
                  lib/registry/components.ts
                </code>{" "}
                will appear across every surface of this site automatically.
              </p>
            }
          >
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link href="/docs/contributing">How to add a component</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/docs/registry-setup">
                  Registry setup
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </Section>
        ) : null}

        {/* Install */}
        <Section
          id="install"
          eyebrow="Install"
          title="Straight into your project"
          aside={
            <>
              <p className="leading-relaxed text-pretty text-muted-foreground">
                Join UI is a shadcn-compatible registry. Point the CLI at the{" "}
                <code className="rounded-sm border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
                  {siteConfig.namespace}
                </code>{" "}
                namespace and it resolves dependencies, writes the files and leaves
                the rest of your codebase alone.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/docs/registry-setup">Registry setup</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/docs/installation">
                    Full installation guide
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          }
        >
          <PackageManagerTabs commands={heroInstall} label="Install a component" />
        </Section>

        {featured.length > 0 ? (
          <Collection
            id="featured"
            eyebrow="Featured"
            title="Start with these"
            description="The components most projects reach for first."
            action={{ href: "/components", label: "View all components" }}
          >
            {/*
              The track count follows the number of cards. A fixed four-column
              grid holding three components leaves a column of nothing at the
              end of the row, which reads as a card that failed to load rather
              than as a registry that is still small.
            */}
            <ul
              className={cn(
                "grid gap-4 sm:grid-cols-2 [--reveal-y:1.5rem]",
                featured.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              )}
            >
              {featured.map((component, index) => (
                <li
                  key={component.slug}
                  className="reveal-item flex"
                  style={revealAt(HEADER_PLACES + index)}
                >
                  <ComponentCard
                    item={toCatalogItem(component)}
                    index={index + 1}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>

            {/*
              Categories ride under the grid instead of holding a section of
              their own. As a section it was a heading, a sentence and — on a
              registry this young — one pill, stranded in the middle of an
              otherwise empty band; as a strip it reads correctly at one
              category and at twelve.
            */}
            {categories.length > 0 ? (
              <div
                className="reveal-item mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:gap-6"
                style={revealAt(HEADER_PLACES + featured.length)}
              >
                <p className="label-section shrink-0 text-muted-foreground">
                  Browse by category
                </p>
                <ul className="flex flex-wrap gap-2 [--reveal-y:0.375rem]">
                  {categories.map((category, index) => (
                    <li
                      key={category.slug}
                      className="reveal-item flex"
                      style={revealAt(HEADER_PLACES + featured.length + 1 + index)}
                    >
                      <Link
                        href={`/components?category=${encodeURIComponent(category.name)}`}
                        className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pr-3 pl-4 text-sm font-medium shadow-xs transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:border-border-hover hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {category.name}
                        <span className="numeral rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {pad(category.count)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Collection>
        ) : null}

        {latest.length > 0 ? (
          <Collection
            id="latest"
            eyebrow="Recently added"
            title="Newest in the registry"
            description="The most recent additions, newest first."
            action={{ href: "/components", label: "See the full catalog" }}
          >
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [--reveal-y:1.5rem]">
              {latest.map((component, index) => (
                <li
                  key={component.slug}
                  className="reveal-item flex"
                  style={revealAt(HEADER_PLACES + index)}
                >
                  <ComponentCard
                    item={toCatalogItem(component)}
                    index={index + 1}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          </Collection>
        ) : null}

        {/* Principles */}
        <Section
          id="principles"
          eyebrow="Principles"
          title="Built like a developer tool"
          aside={
            <p className="leading-relaxed text-pretty text-muted-foreground">
              Six rules the registry is held to, each one carrying the artefact
              it cashes out as — the path, the property, the command. They are
              the reason a component can be dropped into an existing codebase
              without a migration, and the reason the source is worth reading
              once it lands there.
            </p>
          }
          wide
        >
          {/*
            One sheet, not six cards.
            -----------------------------------------------------------------
            This was a grid of rounded panels, each with a fill, a shadow and a
            counter in a pill, floating three-across with a gap between them.
            Nothing was wrong with any one of them and the set was still the
            weakest band on the page: six raised objects in a row read as six
            unrelated things, the gaps put more air inside the section than the
            section has around it, and the drop shadows are the one material on
            this site that is supposed to mean "this surface is above the page"
            — spent here on six paragraphs that are not.

            What replaces them is a single framed sheet divided by hairlines.
            The cells share their rules rather than each carrying their own, so
            the six rules look like one document, which is what they are. It
            also lets the block sit on the page's own colour instead of on a
            fill, so the only lit surfaces left in this section are the ones the
            pointer is on.

            The negative margins are what make that possible in one grid at
            three different column counts: every cell draws its right and bottom
            rule unconditionally, the track is pulled a pixel past the frame's
            inner edge, and `overflow-hidden` on the frame clips the last
            column's and last row's rules away. No `:nth-child` arithmetic that
            has to be rewritten at every breakpoint.

            It arrives as a sheet, too: the frame rises with the section and
            the six cells fade up inside it one after another, reading order,
            so the document is seen being filled in rather than dropped on the
            page. The cells fade without rising — the frame clips at its edge,
            and a cell sliding up through the bottom rule would be cut off by
            the very thing that makes the sheet one object.
          */}
          <div
            className="reveal-item overflow-hidden rounded-xl border border-border"
            style={revealAt(HEADER_PLACES)}
          >
            <ol className="-mr-px -mb-px grid sm:grid-cols-2 xl:grid-cols-3 [--reveal-y:0px]">
              {PRINCIPLES.map((principle, index) => (
                <li
                  key={principle.title}
                  className="group reveal-item relative flex flex-col border-r border-b border-border p-6 transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:bg-subtle"
                  style={revealAt(HEADER_PLACES + 1 + index)}
                >
                  {/*
                    The counter and the rule it starts. The rule is drawn twice:
                    a hairline that is always there, and an ink line over it
                    scaled to nothing until the pointer arrives. Scaling a 1px
                    line is a transform on a layer that never repaints — the
                    section about animation that stays cheap is not allowed to
                    animate any other way, and at reduced motion the global
                    override lands it instantly rather than removing it.
                  */}
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="numeral text-[0.6875rem] text-muted-foreground transition-colors duration-[var(--duration-base)] group-hover:text-foreground"
                    >
                      {pad(index + 1)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative h-px flex-1 bg-border"
                    >
                      <span className="absolute inset-0 origin-left scale-x-0 bg-foreground/45 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-x-100" />
                    </span>
                  </div>

                  <h3 className="mt-5 text-[0.9375rem] font-semibold text-balance">
                    {principle.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>

                  {/*
                    The evidence, on a rule of its own so it reads as a field of
                    the record rather than as the end of the paragraph. `pt-4`
                    against the description's `mt-6` keeps the line sitting
                    closer to what it proves than to the cell below it.
                  */}
                  <p className="mt-6 border-t border-border pt-4 font-mono text-[0.6875rem] text-muted-foreground transition-colors duration-[var(--duration-base)] group-hover:text-foreground">
                    {principle.proof}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* Prompt */}
        <Section
          id="prompt"
          eyebrow="For agents"
          title="Hand the whole component to your agent"
          aside={
            <>
              <p className="leading-relaxed text-pretty text-muted-foreground">
                One button copies a structured brief: the stack, the install path,
                dependencies, every supported prop, the accessibility and motion
                requirements, and the complete source. Built from the same metadata
                as the component page, so it can never describe a prop that does not
                exist.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/docs/ai">How the prompt is built</Link>
                </Button>
              </div>
            </>
          }
        >
          <div className="overflow-hidden rounded-xl border border-border bg-code-bg shadow-xs">
            <p className="label-micro border-b border-border bg-card/40 px-4 py-2.5 text-muted-foreground">
              prompt.txt
            </p>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {`Add the <Component> component to my existing
Next.js application.

Project stack:
- Next.js (App Router)
- React 19 with Server Components
- TypeScript in strict mode
- Tailwind CSS v4 with CSS-variable design tokens

Requirements:
- Install all required dependencies.
- Place the component at
  components/joinui/<component>.tsx.
- Use the project's existing \`cn\` utility …
- Respect \`prefers-reduced-motion: reduce\`.
- Do not modify unrelated files.`}
            </pre>
          </div>
        </Section>

        {/*
          The close.
          ---------------------------------------------------------------------
          This was a call to action: a dark rounded panel, a slogan set centred
          at 2.9rem, two buttons under it. It was the only thing on the page
          addressed to a visitor rather than to a reader, and it showed — every
          other band here is a hairline, a label in the left column and content
          in the grid, and the panel arrived like an advertisement stapled to
          the end of a reference page.

          What replaces it is not a quieter version of the same thing. There is
          no heading, no fill and no button: three destinations set as rows,
          which is the plainest way a documentation page can say where to go
          next. Anyone who has read this far has already decided.
        */}
        <Reveal
          as="nav"
          stagger
          aria-labelledby="next-label"
          className="py-20 lg:py-24"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <p
              id="next-label"
              className="reveal-item label-section text-muted-foreground lg:col-span-3"
              style={revealAt(0)}
            >
              Next
            </p>

            <ul className="min-w-0 border-t border-border lg:col-span-9">
              {/*
                The rule belongs to the row and the tint to the link, inset by
                the padding it gains. Put both on the same element and the
                highlight starts hard against the first letter, which reads as
                a selection rather than as a target.
              */}
              {NEXT.map((item, index) => (
                <li
                  key={item.href}
                  className="reveal-item border-b border-border"
                  style={revealAt(1 + index)}
                >
                  <Link
                    href={item.href}
                    className="group -mx-3 flex items-start justify-between gap-6 rounded-lg px-3 py-5 transition-colors duration-[var(--duration-fast)] hover:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-medium">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </main>
  )
}

/**
 * Rail section: a label and heading held in a narrow left column, the prose
 * beside it, and whatever the section is actually showing in the last four
 * columns. `wide` hands those four columns back to the content, for the grids
 * that need the full measure.
 *
 * Each section is one `Reveal` band: nothing in it moves until the reader has
 * scrolled to it, and then the eyebrow, the heading, the prose and the content
 * arrive in reading order, a step apart. In the narrow form the content column
 * arrives as one piece beside the prose. In the wide form it is left to the
 * caller, whose grid numbers its own items on from `HEADER_PLACES` — a wrapper
 * fading over cells that are also fading would double every edge.
 */
function Section({
  id,
  eyebrow,
  title,
  aside,
  wide = false,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  aside?: React.ReactNode
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <Reveal
      as="section"
      stagger
      aria-labelledby={`${id}-heading`}
      className="border-b border-border py-20 lg:py-24"
    >
      {/*
        `min-w-0` on every cell, because a grid item defaults to `min-width:
        auto` and so refuses to shrink below its content's minimum. Two of
        these sections hold a code block whose longest line does not break —
        `pnpm dlx shadcn@latest add @joinui/<component>` — and without this the
        column widens to fit it, taking the whole page with it and putting a
        horizontal scrollbar on the document at phone widths. `overflow-x-auto`
        on the block itself cannot help until the column is allowed to be
        narrower than the line it is scrolling.
      */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-3">
          <p
            className="reveal-item label-section text-muted-foreground"
            style={revealAt(0)}
          >
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="reveal-item reveal-dither text-[1.5rem] leading-[1.2] font-semibold text-balance [--reveal-y:0.25em]"
            style={revealAt(1)}
          >
            {title}
          </h2>
          {wide && aside ? (
            <div
              className="reveal-item flex max-w-[46ch] flex-col gap-4"
              style={revealAt(2)}
            >
              {aside}
            </div>
          ) : null}
        </div>

        {!wide && aside ? (
          <div
            className="reveal-item flex min-w-0 max-w-xl flex-col gap-4 lg:col-span-5"
            style={revealAt(2)}
          >
            {aside}
          </div>
        ) : null}

        <div
          className={cn(
            "min-w-0",
            wide ? "lg:col-span-9" : "reveal-item lg:col-span-4"
          )}
          style={wide ? undefined : revealAt(2)}
        >
          {children}
        </div>
      </div>
    </Reveal>
  )
}

/**
 * Collection section: a full-width header row over a grid, for the places where
 * the content is the point and the copy is a caption.
 *
 * The same band as `Section`. The header row takes the first `HEADER_PLACES`
 * places — the eyebrow, the heading, then the caption and the link together —
 * and the caller's cards count on from there.
 */
function Collection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  action?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <Reveal
      as="section"
      stagger
      aria-labelledby={`${id}-heading`}
      className="border-b border-border py-20 lg:py-24"
    >
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <p
            className="reveal-item label-section text-muted-foreground"
            style={revealAt(0)}
          >
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="reveal-item reveal-dither text-[1.5rem] leading-[1.2] font-semibold text-balance [--reveal-y:0.25em]"
            style={revealAt(1)}
          >
            {title}
          </h2>
          <p
            className="reveal-item leading-relaxed text-pretty text-muted-foreground"
            style={revealAt(2)}
          >
            {description}
          </p>
        </div>
        {action ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="reveal-item shrink-0"
            style={revealAt(2)}
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight />
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </Reveal>
  )
}
