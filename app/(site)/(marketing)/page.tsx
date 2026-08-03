import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ComponentCard } from "@/components/site/component-card"
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

export const metadata: Metadata = {
  // No `title` — the root layout's `title.default` already reads
  // "Joinway UI — <tagline>", and setting one here would run it through the
  // "%s — Joinway UI" template and repeat the site name.
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

export default function HomePage() {
  const stats = getRegistryStats()
  const featured = getFeaturedComponents(4)
  const latest = getLatestComponents(3)
  const categories = getCategorySummaries().filter((category) => category.count > 0)
  const heroInstall = shadcnCommands(`${siteConfig.namespace}/<component>`)
  const empty = stats.total === 0

  return (
    <main id="main-content">
      {/* Masthead. The glow is lighting, not content — hence aria-hidden. */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <span aria-hidden="true" className="surface-glow -z-10" />
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
          <div className="grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
            <div className="lg:col-span-8">
              <p className="label-caps mb-8 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 text-accent">
                {siteConfig.namespace} — open-code component registry
              </p>
              {/*
                Two-tone: the second line drops a step down the ramp so a
                display size this large lands as a heading rather than as a
                solid block of ink.
              */}
              <h1 className="text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.035em] text-balance">
                Components
                <br />
                <span className="text-grey-800">you actually own</span>
              </h1>
            </div>

            <div className="flex flex-col justify-end gap-6 lg:col-span-4">
              <p className="max-w-[42ch] leading-relaxed text-pretty text-muted-foreground">
                Accessible, animated React components for Next.js. Install them with the
                shadcn CLI, copy the source, or hand the generated prompt to your coding
                agent.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/components">
                    Browse components
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/docs/installation">Get started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Figures */}
      <section aria-label="Registry at a glance" className="border-b border-border">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
          <dl className="grid sm:grid-cols-3">
            <Figure label="Components" value={stats.total} />
            <Figure label="Categories" value={stats.categories} bordered />
            <Figure label="Zero-dependency" value={stats.zeroDependency} bordered />
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
        {empty ? (
          <section aria-labelledby="empty-heading" className="border-b border-border py-16">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="label-caps text-muted-foreground">Status</p>
              </div>
              <div className="flex max-w-2xl flex-col gap-4 lg:col-span-9">
                <h2 id="empty-heading" className="text-2xl font-semibold tracking-tight">
                  The registry is being rebuilt
                </h2>
                <p className="leading-relaxed text-pretty text-muted-foreground">
                  No components are published right now. The registry pipeline, the
                  documentation, the search index and the installable JSON endpoints are
                  all in place and wired to a single metadata file — the first component
                  added to{" "}
                  <code className="rounded-sm border border-accent-border/60 bg-accent-soft px-1 py-0.5 font-mono text-[0.85em] text-accent">
                    lib/registry/components.ts
                  </code>{" "}
                  will appear across every surface of this site automatically.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
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
              </div>
            </div>
          </section>
        ) : null}

        {/* Install */}
        <section aria-labelledby="install-heading" className="border-b border-border py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="label-caps text-muted-foreground">Install</p>
            </div>
            <div className="flex max-w-xl flex-col gap-4 lg:col-span-5">
              <h2 id="install-heading" className="text-2xl font-semibold tracking-tight">
                Straight into your project
              </h2>
              <p className="leading-relaxed text-pretty text-muted-foreground">
                Joinway UI is a shadcn-compatible registry. Point the CLI at the{" "}
                <code className="border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
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
            <div className="lg:col-span-4">
              <PackageManagerTabs commands={heroInstall} label="Install a component" />
            </div>
          </div>
        </section>

        {/* Principles */}
        <section aria-labelledby="principles-heading" className="border-b border-border py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="label-caps text-muted-foreground">Principles</p>
              <h2
                id="principles-heading"
                className="mt-3 text-2xl font-semibold tracking-tight"
              >
                Built like a developer tool
              </h2>
            </div>

            <ol className="grid gap-3 lg:col-span-9 sm:grid-cols-2 xl:grid-cols-3">
              {PRINCIPLES.map((principle, index) => (
                <li
                  key={principle.title}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs"
                >
                  <span className="numeral flex size-6 items-center justify-center rounded-full bg-accent-soft text-[0.6875rem] font-medium text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {featured.length > 0 ? (
          <Collection
            id="featured"
            eyebrow="Featured"
            title="Start with these"
            description="The components most projects reach for first."
            action={{ href: "/components", label: "View all components" }}
          >
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </Collection>
        ) : null}

        {categories.length > 0 ? (
          <Collection
            id="categories"
            eyebrow="Catalog"
            title="Browse by category"
            description="Every category that currently holds at least one component."
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <li key={category.slug} className="flex">
                  <Link
                    href={`/components?category=${encodeURIComponent(category.name)}`}
                    className="group flex w-full flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-accent-border hover:shadow-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="text-sm font-medium transition-colors group-hover:text-accent">
                      {category.name}
                    </span>
                    <span className="numeral text-xs text-muted-foreground">
                      {String(category.count).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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

        {/* Prompt */}
        <section aria-labelledby="prompt-heading" className="py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="label-caps text-muted-foreground">For agents</p>
            </div>
            <div className="flex max-w-xl flex-col gap-4 lg:col-span-5">
              <h2 id="prompt-heading" className="text-2xl font-semibold tracking-tight">
                Hand the whole component to your agent
              </h2>
              <p className="leading-relaxed text-pretty text-muted-foreground">
                One button copies a structured brief: the stack, the install path,
                dependencies, every supported prop, the accessibility and motion
                requirements, and the complete source. Built from the same metadata as
                the component page, so it can never describe a prop that does not exist.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/docs/ai">How the prompt is built</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-code-bg shadow-xs lg:col-span-4">
              <p className="label-caps border-b border-border bg-card/40 px-4 py-2.5 text-muted-foreground">
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
  components/joinway/<component>.tsx.
- Use the project's existing \`cn\` utility …
- Respect \`prefers-reduced-motion: reduce\`.
- Do not modify unrelated files.`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Figure({
  label,
  value,
  bordered = false,
}: {
  label: string
  value: number
  bordered?: boolean
}) {
  return (
    <div className={bordered ? "border-border py-8 sm:border-l sm:pl-8" : "py-8"}>
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd className="numeral mt-2 bg-gradient-to-br from-accent to-brand-500 bg-clip-text text-4xl font-semibold text-transparent">
        {String(value).padStart(2, "0")}
      </dd>
    </div>
  )
}

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
    <section aria-labelledby={`${id}-heading`} className="border-b border-border py-16">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <p className="label-caps text-muted-foreground">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight">
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
