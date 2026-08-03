import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Maximize2 } from "lucide-react"

import { Breadcrumbs } from "@/components/site/breadcrumbs"
import { CodeBlock } from "@/components/site/code-block"
import { CodeTabs } from "@/components/site/code-tabs"
import { ComponentCard } from "@/components/site/component-card"
import { ComponentPreview } from "@/components/site/component-preview"
import { ComponentTabs } from "@/components/site/component-tabs"
import { CopyButton } from "@/components/site/copy-button"
import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { PrevNextNavigation } from "@/components/site/prev-next"
import { PropsTable } from "@/components/site/props-table"
import { DocsShell } from "@/components/site/shell"
import { TableOfContents } from "@/components/site/table-of-contents"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import type { TocEntry } from "@/lib/mdx/source"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated, getSiblings } from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { formatDate } from "@/lib/utils"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Component not found" }

  const url = `${siteConfig.url}/components/${component.slug}`

  return {
    title: component.title,
    description: component.description,
    keywords: [component.name, component.category, ...component.tags],
    alternates: { canonical: `/components/${component.slug}` },
    openGraph: {
      type: "article",
      title: `${component.title} — ${siteConfig.name}`,
      description: component.description,
      url,
      publishedTime: component.since,
    },
    twitter: {
      card: "summary_large_image",
      title: `${component.title} — ${siteConfig.name}`,
      description: component.description,
    },
  }
}

const TOC: TocEntry[] = [
  { id: "preview", title: "Preview", level: 2 },
  { id: "installation", title: "Installation", level: 2 },
  { id: "usage", title: "Usage", level: 2 },
  { id: "props", title: "Props", level: 2 },
  { id: "dependencies", title: "Dependencies", level: 2 },
  { id: "accessibility", title: "Accessibility", level: 2 },
  { id: "keyboard", title: "Keyboard interactions", level: 2 },
  { id: "customization", title: "Customization", level: 2 },
  { id: "related", title: "Related components", level: 2 },
]

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component)
  const { previous, next } = getSiblings(component.slug)

  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: component.title,
    description: component.description,
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    codeRepository: siteConfig.links.repo,
    license: "https://opensource.org/licenses/MIT",
    dateCreated: component.since,
    url: `${siteConfig.url}/components/${component.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DocsShell aside={<TableOfContents entries={TOC} />}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Components", href: "/components" },
            {
              label: component.category,
              href: `/components?category=${encodeURIComponent(component.category)}`,
            },
            { label: component.title },
          ]}
          className="mb-8"
        />

        <header className="flex flex-col gap-5 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{component.category}</Badge>
            <StatusBadge status={component.status} />
            <Badge variant="muted">Added {formatDate(component.since)}</Badge>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
              {component.title}
            </h1>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
              {component.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyPromptButton
              prompt={prompt}
              componentName={component.title}
              variant="primary"
            />
            <CopyButton
              value={component.installCommand}
              label="Copy install command"
              copiedLabel="Command copied"
              toastMessage="Install command copied"
              variant="secondary"
              size="sm"
              showLabel
            />
            <CopyButton
              value={primary.content}
              label="Copy code"
              copiedLabel="Code copied"
              toastMessage="Component source copied"
              variant="secondary"
              size="sm"
              showLabel
            />
            <Button asChild variant="ghost" size="sm">
              <a href={sourceUrl} target="_blank" rel="noreferrer noopener">
                <ExternalLink aria-hidden="true" />
                View source
                <span className="sr-only">on GitHub (opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/preview/${component.slug}`}>
                <Maximize2 aria-hidden="true" />
                Open full preview
              </Link>
            </Button>
          </div>

          <p className="max-w-2xl leading-relaxed text-pretty text-muted-foreground">
            {component.overview}
          </p>
        </header>

        <section aria-labelledby="preview" className="mt-8 scroll-mt-24">
          <h2 id="preview" className="sr-only">
            Preview
          </h2>
          <ComponentTabs
            preview={<ComponentPreview slug={component.slug} title={component.title} />}
            code={
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
                      collapsible
                      showLineNumbers
                    />
                  ),
                }))}
              />
            }
            installation={
              <div className="flex flex-col gap-8">
                <InstallStep
                  title="With the CLI"
                  description={
                    <>
                      Requires the {siteConfig.namespace} namespace in your{" "}
                      <Code>components.json</Code> — see{" "}
                      <Link
                        href="/docs/registry-setup"
                        className="font-medium text-foreground underline underline-offset-4"
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
                </InstallStep>

                <InstallStep
                  title="Without configuring a namespace"
                  description="The registry item is a plain JSON file — point the CLI straight at its URL."
                >
                  <PackageManagerTabs
                    commands={shadcnCommands(registryUrl)}
                    label="Install from a URL"
                  />
                </InstallStep>

                <InstallStep
                  title="Manually"
                  description={
                    component.dependencies.length > 0 ? (
                      <>
                        Install the dependencies, then copy the source into{" "}
                        <Code>{primary.target}</Code>.
                      </>
                    ) : (
                      <>
                        No dependencies to install. Copy the source into{" "}
                        <Code>{primary.target}</Code> and you are done.
                      </>
                    )
                  }
                >
                  {component.dependencies.length > 0 ? (
                    <PackageManagerTabs
                      commands={dependencyCommands(component.dependencies)}
                      label="Install dependencies"
                    />
                  ) : null}
                  <CodeBlock
                    code={primary.content}
                    language={primary.language}
                    title={primary.target}
                    collapsible
                    collapsedHeight={280}
                  />
                </InstallStep>
              </div>
            }
            prompt={
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    A structured brief for Cursor, Claude Code, Codex or any other
                    coding agent. It is generated from this component&apos;s metadata
                    and its real source file, so it can never describe a prop that does
                    not exist.
                  </p>
                  <CopyPromptButton prompt={prompt} componentName={component.title} />
                </div>
                <CodeBlock
                  code={prompt}
                  language="text"
                  title={`${component.slug}.prompt.txt`}
                  collapsible
                  collapsedHeight={460}
                />
              </div>
            }
          />
        </section>

        <Section id="installation" title="Installation">
          <p>
            Install {component.title} with the shadcn CLI. The registry item resolves
            its own dependencies and writes the file to <Code>{primary.target}</Code>.
          </p>
          <PackageManagerTabs
            commands={shadcnCommands(registryTarget)}
            label="Install this component"
          />
        </Section>

        <Section id="usage" title="Usage">
          <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
        </Section>

        <Section id="props" title="Props">
          <PropsTable groups={component.props} />
        </Section>

        <Section id="dependencies" title="Dependencies">
          <div className="grid gap-3 sm:grid-cols-2">
            <DependencyPanel
              title="npm packages"
              items={component.dependencies}
              emptyMessage="None — this component only needs React and Tailwind."
            />
            <DependencyPanel
              title="Registry items"
              items={component.registryDependencies}
              emptyMessage="None."
              note="Installed automatically by the CLI when they are missing."
            />
          </div>
        </Section>

        <Section id="accessibility" title="Accessibility">
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-border-strong">
            {component.accessibility.map((note) => (
              <li key={note} className="leading-[1.75]">
                {note}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="keyboard" title="Keyboard interactions">
          {component.keyboard.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Keyboard interactions for {component.title}
                </caption>
                <thead>
                  <tr className="border-b border-border bg-subtle">
                    <th scope="col" className="label-caps px-4 py-2.5 text-muted-foreground">
                      Key
                    </th>
                    <th scope="col" className="label-caps px-4 py-2.5 text-muted-foreground">
                      Behaviour
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {component.keyboard.map((entry) => (
                    <tr
                      key={entry.keys.join("-")}
                      className="border-b border-border align-top last:border-b-0"
                    >
                      <th scope="row" className="px-4 py-3 text-left whitespace-nowrap">
                        <span className="flex flex-wrap gap-1">
                          {entry.keys.map((key) => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </span>
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              {component.title} renders no interactive controls of its own, so it adds
              nothing to the tab order.
            </p>
          )}
        </Section>

        <Section id="customization" title="Customization">
          <div className="flex flex-col gap-8">
            {component.customization.map((example) => (
              <div key={example.title} className="flex flex-col gap-2">
                <h3 className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                  {example.title}
                </h3>
                <p className="text-sm leading-relaxed">{example.description}</p>
                <CodeBlock
                  code={example.code}
                  language={example.language ?? "tsx"}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </Section>

        {related.length > 0 ? (
          <Section id="related" title="Related components">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} className="flex">
                  <ComponentCard
                    item={toCatalogItem(item)}
                    layout="list"
                    className="-mt-px -ml-px w-full"
                  />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <PrevNextNavigation
          className="mt-12"
          label="Component navigation"
          previous={
            previous
              ? { title: previous.title, href: `/components/${previous.slug}` }
              : undefined
          }
          next={
            next ? { title: next.title, href: `/components/${next.slug}` } : undefined
          }
        />
      </DocsShell>
    </>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border border-accent-border/60 bg-accent-soft px-1 py-0.5 font-mono text-[0.85em] text-accent">
      {children}
    </code>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="mt-12 scroll-mt-24 border-t border-border pt-8"
    >
      <h2 id={id} className="mb-5 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-4 leading-[1.75] text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function InstallStep({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function DependencyPanel({
  title,
  items,
  emptyMessage,
  note,
  className,
}: {
  title: string
  items: string[]
  emptyMessage: string
  note?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-xs ${className ?? ""}`}
    >
      <h3 className="label-caps text-muted-foreground">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item}>
              <Badge variant="neutral" size="md" className="normal-case">
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      {note ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{note}</p>
      ) : null}
    </div>
  )
}
