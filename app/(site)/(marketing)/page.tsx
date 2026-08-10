import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ComponentCard } from "@/components/site/component-card"
import { Masthead, type MastheadFact } from "@/components/site/masthead"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Button } from "@/components/ui/button"
import { shadcnCommands } from "@/lib/commands"
import {
  getCategorySummaries,
  getFeaturedComponents,
  getLatestComponents,
  getRegistryStats,
} from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  // No `title` — the root layout's `title.default` already reads
  // "Join UI — <tagline>", and setting one here would run it through the
  // "%s — Join UI" template and repeat the site name.
  description: siteConfig.description,
  alternates: { canonical: "/" },
}

const PRINCIPLES = [
  {
    title: "Open code, not a black box",
    description:
      "The CLI writes real files into your repository. Read them, edit them, delete the parts you do not need — there is no wrapper package to fight.",
  },
  {
    title: "One click to an AI-ready prompt",
    description:
      "Every component page ships a structured prompt with props, accessibility rules and the full source, generated from the same metadata that builds the page.",
  },
  {
    title: "WCAG 2.2 AA as the baseline",
    description:
      "Keyboard paths, focus management, live regions and reduced-motion fallbacks are part of each component, not a later pass.",
  },
  {
    title: "Animation that stays cheap",
    description:
      "Transform and opacity only, listeners scoped to the viewport, and every effect degrading to a static state when motion is turned down.",
  },
  {
    title: "A real shadcn registry",
    description:
      "Namespaced items, resolved dependencies and validated schemas — installable by name or by URL, from any project.",
  },
  {
    title: "Typed end to end",
    description:
      "Strict TypeScript with exported prop types. No `any`, no ambient globals, no build-time surprises.",
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
      <Masthead
        eyebrow={`${siteConfig.namespace} — open-code component registry`}
        facts={facts}
      />

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
                "grid gap-4 sm:grid-cols-2",
                featured.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              )}
            >
              {featured.map((component, index) => (
                <li key={component.slug} className="flex">
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
              <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:gap-6">
                <p className="label-section shrink-0 text-muted-foreground">
                  Browse by category
                </p>
                <ul className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li key={category.slug} className="flex">
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
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((component, index) => (
                <li key={component.slug} className="flex">
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
              Six rules the registry is held to. They are the reason a component
              can be dropped into an existing codebase without a migration, and
              the reason the source is worth reading once it lands there.
            </p>
          }
          wide
        >
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <li
                key={principle.title}
                className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 shadow-xs transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] hover:border-border-hover hover:shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="numeral flex size-7 items-center justify-center rounded-full border border-border text-[0.6875rem] text-muted-foreground"
                >
                  {pad(index + 1)}
                </span>
                <h3 className="text-[0.9375rem] font-semibold">{principle.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </li>
            ))}
          </ol>
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
        <nav aria-labelledby="next-label" className="py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <p id="next-label" className="label-section text-muted-foreground lg:col-span-3">
              Next
            </p>

            <ul className="min-w-0 border-t border-border lg:col-span-9">
              {/*
                The rule belongs to the row and the tint to the link, inset by
                the padding it gains. Put both on the same element and the
                highlight starts hard against the first letter, which reads as
                a selection rather than as a target.
              */}
              {NEXT.map((item) => (
                <li key={item.href} className="border-b border-border">
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
        </nav>
      </div>
    </main>
  )
}

/**
 * Rail section: a label and heading held in a narrow left column, the prose
 * beside it, and whatever the section is actually showing in the last four
 * columns. `wide` hands those four columns back to the content, for the grids
 * that need the full measure.
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
    <section
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
          <p className="label-section text-muted-foreground">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="text-[1.5rem] leading-[1.2] font-semibold text-balance"
          >
            {title}
          </h2>
          {wide && aside ? (
            <div className="flex max-w-[46ch] flex-col gap-4">{aside}</div>
          ) : null}
        </div>

        {!wide && aside ? (
          <div className="flex min-w-0 max-w-xl flex-col gap-4 lg:col-span-5">
            {aside}
          </div>
        ) : null}

        <div className={cn("min-w-0", wide ? "lg:col-span-9" : "lg:col-span-4")}>
          {children}
        </div>
      </div>
    </section>
  )
}

/**
 * Collection section: a full-width header row over a grid, for the places where
 * the content is the point and the copy is a caption.
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
    <section
      aria-labelledby={`${id}-heading`}
      className="border-b border-border py-20 lg:py-24"
    >
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="label-section text-muted-foreground">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="text-[1.5rem] leading-[1.2] font-semibold text-balance"
          >
            {title}
          </h2>
          <p className="leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? (
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href={action.href}>
              {action.label}
              <ArrowRight />
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  )
}
