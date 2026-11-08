import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, FileCode2 } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { CodeTabs } from "@/components/site/code-tabs"
import { CopyButton } from "@/components/site/copy-button"
import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { GitHubIcon } from "@/components/site/icons"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { GalleryCard, StatusPill } from "@/components/site/card"
import {
  categoryHref,
  formatDate,
  toGalleryItem,
} from "@/components/site/data"
import { RailRow } from "@/components/site/rail-row"
import { Toc } from "@/components/site/toc"
import { Workbench } from "@/components/site/workbench"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import {
  allComponents,
  getComponent,
  getRelated,
  getSiblings,
  getTraits,
} from "@/lib/registry"
import { getComponentSources, type SourceFile } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import type { ComponentMetadata } from "@/types/registry"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Component not found", robots: { index: false } }
  return {
    title: component.title,
    description: component.description,
    robots: { index: false, follow: false },
  }
}

const TOC = [
  { id: "overview", title: "Overview", level: 2 as const },
  { id: "usage", title: "Usage", level: 2 as const },
  { id: "examples", title: "Examples", level: 2 as const },
  { id: "accessibility", title: "Accessibility", level: 2 as const },
  { id: "keyboard", title: "Keyboard", level: 2 as const },
  { id: "related", title: "Related", level: 2 as const },
]

export default async function GalleryComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component, 6)
  const { previous, next } = getSiblings(component.slug)
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`
  const propCount = component.props.reduce(
    (total, group) => total + group.props.length,
    0
  )

  return (
    <main id="main-content">
      <header className="flex flex-col gap-4 px-4 pt-6 pb-5 sm:px-6 lg:px-8 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[0.8125rem]">
            <Link
              href={categoryHref(component.category)}
              className="rounded-md text-[var(--g-ink-3)] transition-colors hover:text-[var(--g-ink)]"
            >
              {component.category}
            </Link>
            <span aria-hidden="true" className="text-[var(--g-ink-4)]">
              ·
            </span>
            <span className="text-[var(--g-ink-4)]">
              Added {formatDate(component.since)}
              {component.updated ? ` · Updated ${formatDate(component.updated)}` : null}
            </span>
            <StatusPill item={{ status: component.status }} />
          </div>
          <h1 className="g-title mt-2 text-[1.75rem] text-[var(--g-ink)] sm:text-[2rem]">
            {component.title}
          </h1>
          <p className="mt-1.5 max-w-3xl text-[0.9375rem] leading-relaxed text-pretty text-[var(--g-ink-3)]">
            {component.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="g-accent-scope">
            <CopyPromptButton
              prompt={prompt}
              componentName={component.title}
              variant="primary"
              size="md"
            />
          </span>
          <CopyButton
            value={component.installCommand}
            label="Copy install"
            copiedLabel="Copied"
            toastMessage="Install command copied"
            variant="secondary"
            size="md"
            showLabel
          />
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="g-btn"
          >
            <GitHubIcon aria-hidden="true" />
            Source
            <span className="sr-only">on GitHub (opens in a new tab)</span>
          </a>
          <span className="ml-1 flex items-center gap-1">
            <SiblingLink direction="previous" component={previous} />
            <SiblingLink direction="next" component={next} />
          </span>
        </div>
      </header>

      <Workbench
        slug={component.slug}
        title={component.title}
        tabs={[
          {
            value: "install",
            label: "Install",
            content: <InstallPanel component={component} primary={primary} />,
          },
          {
            value: "code",
            label: "Code",
            count: sources.length,
            content: <CodePanel component={component} sources={sources} />,
          },
          {
            value: "prompt",
            label: "Prompt",
            content: <PromptPanel component={component} prompt={prompt} />,
          },
          {
            value: "props",
            label: "Props",
            count: propCount,
            content: <PropsPanel component={component} />,
          },
        ]}
      />

      <div className="grid gap-12 px-4 pt-14 pb-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_12rem] 2xl:gap-20">
        <div className="flex max-w-[52rem] min-w-0 flex-col gap-16">
          <Section id="overview" title="Overview">
            <p className="text-[0.9375rem] leading-[1.75] text-pretty text-[var(--g-ink-2)]">
              {component.overview}
            </p>
            <Facts component={component} primary={primary} />
          </Section>

          <Section
            id="usage"
            title="Usage"
            lead="The smallest working example — paste it into any page."
          >
            <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
          </Section>

          <Section
            id="examples"
            title="Examples"
            lead={`${component.customization.length} ways to bend it, each a change you make in your own copy.`}
          >
            <div className="flex flex-col gap-10">
              {component.customization.map((example, index) => (
                <div key={example.title} className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="g-num font-mono text-[0.75rem] text-[var(--g-ink-4)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[1rem] font-semibold tracking-[-0.016em] text-[var(--g-ink)]">
                        {example.title}
                      </h3>
                      <p className="mt-1 text-[0.875rem] leading-relaxed text-[var(--g-ink-3)]">
                        {example.description}
                      </p>
                    </div>
                  </div>
                  <CodeBlock
                    code={example.code}
                    language={example.language ?? "tsx"}
                    collapsible
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="accessibility"
            title="Accessibility"
            lead="What the component guarantees, and what any edit has to keep."
          >
            <ul className="flex flex-col divide-y divide-[var(--g-line)] rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)]">
              {component.accessibility.map((note) => (
                <li key={note} className="flex gap-3 px-4 py-3.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--g-accent-soft)] text-[var(--g-accent-ink)]">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="text-[0.875rem] leading-relaxed text-[var(--g-ink-2)]">
                    <InlineCode text={note} />
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="keyboard" title="Keyboard">
            {component.keyboard.length > 0 ? (
              <dl className="flex flex-col divide-y divide-[var(--g-line)] rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)]">
                {component.keyboard.map((entry) => (
                  <div
                    key={entry.keys.join("+")}
                    className="grid gap-2 px-4 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-6"
                  >
                    <dt className="flex flex-wrap items-center gap-1.5">
                      {entry.keys.map((key, index) => (
                        <span key={key} className="flex items-center gap-1.5">
                          {index > 0 ? (
                            <span
                              aria-hidden="true"
                              className="text-[0.75rem] text-[var(--g-ink-4)]"
                            >
                              /
                            </span>
                          ) : null}
                          <kbd className="g-keycap">{key}</kbd>
                        </span>
                      ))}
                    </dt>
                    <dd className="text-[0.875rem] leading-relaxed text-[var(--g-ink-2)]">
                      <InlineCode text={entry.description} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="rounded-2xl border border-dashed border-[var(--g-line-2)] px-4 py-5 text-[0.875rem] leading-relaxed text-[var(--g-ink-3)]">
                {component.title} has no controls of its own, so it adds nothing to the
                tab order. Anything you pass into it keeps its own keyboard behaviour.
              </p>
            )}
          </Section>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--g-top)+2rem)]">
            <Toc entries={TOC} />
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-14 px-4 pt-10 pb-10 sm:px-6 lg:px-8">
        {related.length > 0 ? (
          <div id="related" className="scroll-mt-24">
            <RailRow
              id="related-heading"
              title="Related"
              description={`More from ${component.category}, and the components it is usually used with.`}
              href={categoryHref(component.category)}
              hrefLabel={`All ${component.category}`}
            >
              {related.map((item) => (
                <GalleryCard key={item.slug} item={toGalleryItem(item)} />
              ))}
            </RailRow>
          </div>
        ) : null}

        <nav
          aria-label="Previous and next component"
          className="grid gap-3 sm:grid-cols-2"
        >
          {previous ? (
            <PrevNextCard direction="previous" component={previous} />
          ) : (
            <span />
          )}
          {next ? <PrevNextCard direction="next" component={next} /> : null}
        </nav>
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ parts */

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2
          id={id}
          className="g-title scroll-mt-[calc(var(--g-top)+1.5rem)] text-[1.375rem] text-[var(--g-ink)]"
        >
          {title}
        </h2>
        {lead ? <p className="text-[0.875rem] text-[var(--g-ink-3)]">{lead}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Notes are written with `backticks`; set those as code without parsing markdown. */
function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={index}
            className="rounded-[0.3rem] border border-[var(--g-line-2)] bg-[var(--g-panel-2)] px-1 py-px text-[0.8em] text-[#e4e4e7]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

function Facts({
  component,
  primary,
}: {
  component: ComponentMetadata
  primary: SourceFile
}) {
  const traits = getTraits(component)
  const facts: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: "Category",
      value: (
        <Link
          href={categoryHref(component.category)}
          className="hover:text-[var(--g-ink)]"
        >
          {component.category}
        </Link>
      ),
    },
    { label: "Status", value: <span className="capitalize">{component.status}</span> },
    { label: "Added", value: formatDate(component.since) },
    {
      label: "Updated",
      value: component.updated ? formatDate(component.updated) : "—",
    },
    {
      label: "npm",
      value:
        component.dependencies.length > 0 ? component.dependencies.join(", ") : "None",
    },
    {
      label: "Installs to",
      value: <code className="text-[0.8125rem]">{primary.target}</code>,
    },
    { label: "Traits", value: traits.length > 0 ? traits.join(" · ") : "—" },
    { label: "Licence", value: "MIT" },
  ]
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--g-line)] sm:grid-cols-4">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex min-w-0 flex-col gap-1 border-[var(--g-line)] px-4 py-3.5 [&:not(:nth-child(2n+1))]:border-l sm:[&:not(:nth-child(4n+1))]:border-l [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 sm:[&:nth-child(n+5)]:border-t"
        >
          <dt className="text-[0.75rem] text-[var(--g-ink-4)]">{fact.label}</dt>
          <dd className="truncate text-[0.875rem] text-[var(--g-ink-2)]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function SiblingLink({
  direction,
  component,
}: {
  direction: "previous" | "next"
  component: ComponentMetadata | undefined
}) {
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight
  if (!component) {
    return (
      <span
        aria-hidden="true"
        className="g-icon-btn border border-[var(--g-line)] opacity-35"
      >
        <Icon />
      </span>
    )
  }
  return (
    <Link
      href={`/components/${component.slug}`}
      className="g-icon-btn border border-[var(--g-line)]"
      aria-label={`${direction === "previous" ? "Previous" : "Next"}: ${component.title}`}
      title={component.title}
    >
      <Icon aria-hidden="true" />
    </Link>
  )
}

function PrevNextCard({
  direction,
  component,
}: {
  direction: "previous" | "next"
  component: ComponentMetadata
}) {
  const next = direction === "next"
  return (
    <Link
      href={`/components/${component.slug}`}
      className={`group flex flex-col gap-1 rounded-2xl border border-[var(--g-line)] bg-[var(--g-panel)] px-5 py-4 transition-colors hover:border-[var(--g-line-3)] ${next ? "items-end text-right sm:col-start-2" : ""}`}
    >
      <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--g-ink-4)]">
        {next ? null : <ArrowLeft aria-hidden="true" className="size-3.5" />}
        {next ? "Next" : "Previous"}
        {next ? <ArrowRight aria-hidden="true" className="size-3.5" /> : null}
      </span>
      <span className="text-[0.9375rem] font-medium text-[var(--g-ink)]">
        {component.title}
      </span>
      <span className="text-[0.8125rem] text-[var(--g-ink-3)]">
        {component.category}
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ panel */

function PanelBlock({
  step,
  title,
  note,
  children,
}: {
  step?: number
  title: string
  note?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {step ? (
          <span className="g-num mt-px flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--g-line-2)] text-[0.6875rem] font-medium text-[var(--g-ink-2)]">
            {step}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[0.875rem] font-medium text-[var(--g-ink)]">{title}</h3>
          {note ? (
            <p className="text-[0.8125rem] leading-relaxed text-[var(--g-ink-3)]">
              {note}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[0.3rem] border border-[var(--g-line-2)] bg-[var(--g-panel-2)] px-1 py-px text-[0.8em] text-[#e4e4e7]">
      {children}
    </code>
  )
}

function InstallPanel({
  component,
  primary,
}: {
  component: ComponentMetadata
  primary: SourceFile
}) {
  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const deps = component.dependencies
  const lines = primary.content.trimEnd().split("\n").length

  return (
    <div className="flex flex-col gap-7 p-4">
      <PanelBlock
        step={1}
        title="Add it with the shadcn CLI"
        note={
          <>
            Needs the <Mono>{siteConfig.namespace}</Mono> namespace in{" "}
            <Mono>components.json</Mono> —{" "}
            <Link
              href={"/docs/registry-setup"}
              className="text-[var(--g-ink-2)] underline decoration-[var(--g-line-3)] underline-offset-4 hover:text-[var(--g-ink)]"
            >
              registry setup
            </Link>
            .
          </>
        }
      >
        <PackageManagerTabs
          commands={shadcnCommands(registryTarget)}
          label="Install with the shadcn CLI"
        />
      </PanelBlock>

      <PanelBlock
        step={2}
        title="Or point it at the URL"
        note="No configuration: the registry item is a plain JSON file."
      >
        <PackageManagerTabs
          commands={shadcnCommands(registryUrl)}
          label="Install from the registry URL"
        />
      </PanelBlock>

      <PanelBlock
        step={3}
        title="Or copy it in by hand"
        note={
          deps.length > 0 ? (
            <>
              Install{" "}
              {deps.length === 1 ? "the dependency" : `the ${deps.length} dependencies`}
              , then paste the source into the file below.
            </>
          ) : (
            <>
              Nothing to install. Paste the source into the file below and you are done.
            </>
          )
        }
      >
        {deps.length > 0 ? (
          <PackageManagerTabs
            commands={dependencyCommands(deps)}
            label="Install dependencies"
          />
        ) : null}
        <div className="flex items-center gap-3 rounded-xl border border-[var(--g-line)] bg-[var(--g-panel)] px-3 py-2.5">
          <FileCode2
            aria-hidden="true"
            className="size-4 shrink-0 text-[var(--g-ink-3)]"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-[0.75rem] text-[var(--g-ink)]">
              {primary.target}
            </span>
            <span className="g-num block text-[0.6875rem] text-[var(--g-ink-4)]">
              {lines} lines · see Code
            </span>
          </span>
          <CopyButton
            value={primary.content}
            label="Copy source"
            copiedLabel="Source copied"
            toastMessage={`${primary.name} copied`}
          />
        </div>
      </PanelBlock>

      <div className="grid gap-3 border-t border-[var(--g-line)] pt-5">
        <DependencyRow
          title="npm packages"
          items={deps}
          empty="None beyond React and Tailwind"
        />
        <DependencyRow
          title="Registry items"
          items={component.registryDependencies}
          empty="None"
        />
      </div>
    </div>
  )
}

function DependencyRow({
  title,
  items,
  empty,
}: {
  title: string
  items: string[]
  empty: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="w-28 shrink-0 text-[0.75rem] text-[var(--g-ink-4)]">
        {title}
      </span>
      {items.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="g-pill font-mono text-[var(--g-ink-2)]">
              {item}
            </span>
          ))}
        </span>
      ) : (
        <span className="text-[0.8125rem] text-[var(--g-ink-3)]">{empty}</span>
      )}
    </div>
  )
}

function CodePanel({
  component,
  sources,
}: {
  component: ComponentMetadata
  sources: SourceFile[]
}) {
  return (
    <div className="p-4">
      <CodeTabs
        label={`${component.title} source files`}
        items={sources.map((source) => ({
          value: source.name,
          label: source.name,
          content: (
            <CodeBlock
              code={source.content}
              language={source.language}
              title={source.target}
              showLineNumbers
            />
          ),
        }))}
      />
    </div>
  )
}

function PromptPanel({
  component,
  prompt,
}: {
  component: ComponentMetadata
  prompt: string
}) {
  const lines = prompt.split("\n").length
  const kb = (new TextEncoder().encode(prompt).length / 1024).toFixed(1)
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[0.8125rem] leading-relaxed text-[var(--g-ink-3)]">
        One brief for Claude Code, Cursor or Codex. It is assembled from this
        component&apos;s metadata and its real source file, so it names the install
        path, the dependencies, every prop and every accessibility rule — and cannot
        describe a prop that does not exist.{" "}
        <Link
          href={"/docs/ai"}
          className="text-[var(--g-ink-2)] underline decoration-[var(--g-line-3)] underline-offset-4 hover:text-[var(--g-ink)]"
        >
          How it is built
        </Link>
      </p>
      <div className="flex items-center gap-3">
        <span className="g-accent-scope">
          <CopyPromptButton
            prompt={prompt}
            componentName={component.title}
            variant="primary"
          />
        </span>
        <span className="g-num text-[0.75rem] text-[var(--g-ink-4)]">
          {lines} lines · {kb} KB
        </span>
      </div>
      <CodeBlock code={prompt} language="text" title={`${component.slug}.prompt.txt`} />
    </div>
  )
}

function PropsPanel({ component }: { component: ComponentMetadata }) {
  if (component.props.length === 0) {
    return (
      <p className="p-4 text-[0.875rem] text-[var(--g-ink-3)]">
        This component takes no props.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-6 p-4">
      {component.props.map((group) => (
        <section key={group.name} className="flex flex-col gap-2.5">
          <div>
            <h3 className="font-mono text-[0.8125rem] font-medium text-[var(--g-ink)]">
              {group.name}
            </h3>
            {group.description ? (
              <p className="mt-0.5 text-[0.8125rem] text-[var(--g-ink-3)]">
                {group.description}
              </p>
            ) : null}
          </div>
          <table className="w-full table-fixed border-collapse overflow-hidden rounded-xl text-left">
            <caption className="sr-only">Props for {group.name}</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type, default and description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--g-line)] border border-[var(--g-line)] bg-[var(--g-panel)]">
              {group.props.map((prop) => (
                <tr key={prop.name} className="align-top">
                  <th
                    scope="row"
                    className="w-[36%] px-3 py-3 font-mono text-[0.75rem] font-medium break-words text-[var(--g-ink)]"
                  >
                    {prop.name}
                    {prop.required ? (
                      <>
                        <span aria-hidden="true" className="text-[var(--g-accent-ink)]">
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </>
                    ) : null}
                  </th>
                  <td className="py-3 pr-3">
                    <code className="block font-mono text-[0.75rem] break-words text-[var(--g-accent-ink)]">
                      {prop.type}
                    </code>
                    {prop.defaultValue ? (
                      <span className="mt-1 block font-mono text-[0.6875rem] text-[var(--g-ink-4)]">
                        default {prop.defaultValue}
                      </span>
                    ) : null}
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--g-ink-3)]">
                      <InlineCode text={prop.description} />
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
