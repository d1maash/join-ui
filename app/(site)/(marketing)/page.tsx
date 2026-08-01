import type { Metadata } from "next"
import Link from "next/link"
import {
  Accessibility,
  ArrowRight,
  Box,
  Gauge,
  Layers,
  Package,
  Sparkles,
  Terminal,
} from "lucide-react"

import { ComponentCard } from "@/components/docs/component-card"
import { ComponentPreview } from "@/components/docs/component-preview"
import {
  PackageManagerTabs,
  shadcnCommands,
} from "@/components/docs/package-manager-tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getCategorySummaries,
  getFeaturedComponents,
  getLatestComponents,
  getRegistryStats,
} from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { siteConfig } from "@/lib/site"
import { AuroraBackground } from "@/registry/components/aurora-background"
import { MagneticButton } from "@/registry/components/magnetic-button"
import { TextScramble } from "@/registry/components/text-scramble"

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
}

const BENEFITS = [
  {
    icon: Box,
    title: "Open code, not a black box",
    description:
      "The CLI writes real files into your repository. Read them, edit them, delete the parts you do not need — there is no wrapper package to fight.",
  },
  {
    icon: Sparkles,
    title: "One click to an AI-ready prompt",
    description:
      "Every component page ships a structured prompt with props, accessibility rules and the full source, generated from the same metadata that builds the page.",
  },
  {
    icon: Accessibility,
    title: "WCAG 2.2 AA as the baseline",
    description:
      "Keyboard paths, focus management, live regions and reduced-motion fallbacks are part of each component, not a later pass.",
  },
  {
    icon: Gauge,
    title: "Animation that stays cheap",
    description:
      "Transform and opacity only, listeners scoped to the viewport, and every effect degrading to a static state when motion is turned down.",
  },
  {
    icon: Package,
    title: "A real shadcn registry",
    description:
      "Namespaced items, resolved dependencies and validated schemas — installable by name or by URL, from any project.",
  },
  {
    icon: Terminal,
    title: "Typed end to end",
    description:
      "Strict TypeScript with exported prop types. No `any`, no ambient globals, no build-time surprises.",
  },
]

export default function HomePage() {
  const stats = getRegistryStats()
  const featured = getFeaturedComponents(4)
  const latest = getLatestComponents(3)
  const categories = getCategorySummaries()
  const heroInstall = shadcnCommands(`${siteConfig.namespace}/magnetic-button`)

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <AuroraBackground asLayer intensity="subtle" speed={24} />
        <div aria-hidden="true" className="backdrop-grid absolute inset-0" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Link
            href="/docs/ai"
            className="group flex items-center gap-2 rounded-full border border-border bg-card/80 py-1 pr-3 pl-1 text-xs backdrop-blur-sm transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Badge variant="primary" className="rounded-full">
              New
            </Badge>
            <span className="text-muted-foreground">
              Copy an agent-ready prompt for any component
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            <TextScramble
              as="span"
              text="Motion-first components"
              speed={2}
              className="block"
            />
            <span className="text-brand-gradient block">you actually own</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {stats.total} accessible, animated React components for Next.js. Install
            them with the shadcn CLI, copy the source, or hand the generated prompt to
            your coding agent.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <MagneticButton asChild size="lg">
              <Link href="/components">
                Browse components
                <ArrowRight />
              </Link>
            </MagneticButton>
            <MagneticButton asChild variant="outline" size="lg">
              <Link href="/docs/installation">Get started</Link>
            </MagneticButton>
          </div>

          <dl className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt>Components</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {stats.total}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>Categories</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {stats.categories}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>Zero-dependency</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {stats.zeroDependency}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
        {/* Install */}
        <section aria-labelledby="install-heading" className="py-16">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-3">
              <h2
                id="install-heading"
                className="text-2xl font-semibold tracking-tight"
              >
                Install straight into your project
              </h2>
              <p className="leading-relaxed text-pretty text-muted-foreground">
                Joinway UI is a shadcn-compatible registry. Point the CLI at the{" "}
                <code className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                  {siteConfig.namespace}
                </code>{" "}
                namespace and it resolves dependencies, writes the files and leaves the
                rest of your codebase alone.
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
            </div>

            <PackageManagerTabs
              commands={heroInstall}
              label="Install a component"
              className="my-0"
            />
          </div>
        </section>

        {/* Live demo */}
        <section aria-labelledby="demo-heading" className="py-8">
          <SectionHeading
            id="demo-heading"
            eyebrow="Interactive"
            title="Try before you install"
            description="Every preview on this site runs the exact source the CLI ships — same file, no simplified demo build."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ComponentPreview
              slug="spotlight-card"
              title="Spotlight Card"
              minHeight="20rem"
            />
            <ComponentPreview
              slug="metric-card"
              title="Metric Card"
              minHeight="20rem"
            />
          </div>
        </section>

        {/* Benefits */}
        <section aria-labelledby="benefits-heading" className="py-16">
          <SectionHeading
            id="benefits-heading"
            eyebrow="Why Joinway"
            title="Built like a developer tool"
            description="Opinionated where it saves you time, uncommitted everywhere else."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
              >
                <span
                  aria-hidden="true"
                  className="mb-1 flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
                >
                  <Icon className="size-4" />
                </span>
                <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Featured */}
        <section aria-labelledby="featured-heading" className="py-8">
          <SectionHeading
            id="featured-heading"
            eyebrow="Featured"
            title="Start with these"
            description="The components most projects reach for first."
            action={{ href: "/components", label: "View all components" }}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((component) => (
              <ComponentCard key={component.slug} item={toCatalogItem(component)} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section aria-labelledby="categories-heading" className="py-16">
          <SectionHeading
            id="categories-heading"
            eyebrow="Catalog"
            title="Browse by category"
            description="Twelve categories, from buttons to full background systems."
          />
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/components?category=${encodeURIComponent(category.name)}`}
                  aria-disabled={category.count === 0}
                  className="group flex h-full flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-[var(--duration-base)] hover:border-border-strong hover:shadow-[var(--shadow-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Layers
                    aria-hidden="true"
                    className="mb-1 size-4 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.count} component{category.count === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Prompt */}
        <section aria-labelledby="prompt-heading" className="py-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-3">
                <Badge variant="primary" className="w-fit">
                  <Sparkles aria-hidden="true" className="size-2.5" />
                  Copy prompt
                </Badge>
                <h2
                  id="prompt-heading"
                  className="text-2xl font-semibold tracking-tight"
                >
                  Hand the whole component to your agent
                </h2>
                <p className="leading-relaxed text-pretty text-muted-foreground">
                  One button copies a structured brief: the stack, the install path,
                  dependencies, every supported prop, the accessibility and motion
                  requirements, and the complete source. Built from the same metadata as
                  this page, so it can never describe a prop that does not exist.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/docs/ai">How the prompt is built</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/components/magnetic-button">
                      See it on a component
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-code-bg">
                <div className="border-b border-border bg-muted/50 px-4 py-2 font-mono text-xs text-muted-foreground">
                  prompt.txt
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {`Add the MagneticButton component to my existing
Next.js application.

Project stack:
- Next.js (App Router)
- React 19 with Server Components
- TypeScript in strict mode
- Tailwind CSS v4 with CSS-variable design tokens

Requirements:
- Install all required dependencies: motion,
  @radix-ui/react-slot.
- Place the component at
  components/joinway/magnetic-button.tsx.
- Use the project's existing \`cn\` utility …
- Respect \`prefers-reduced-motion: reduce\`.
- Do not modify unrelated files.`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Latest */}
        <section aria-labelledby="latest-heading" className="py-16">
          <SectionHeading
            id="latest-heading"
            eyebrow="Recently added"
            title="Newest in the registry"
            description="The three most recent additions, newest first."
            action={{ href: "/components", label: "See the full catalog" }}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((component) => (
              <ComponentCard key={component.slug} item={toCatalogItem(component)} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <p className="text-[0.6875rem] font-medium tracking-wider text-primary uppercase">
          {eyebrow}
        </p>
        <h2 id={id} className="text-2xl font-semibold tracking-tight">
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
  )
}
