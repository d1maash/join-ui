import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Maximize2, Package, Puzzle } from "lucide-react"

import { CodeBlock } from "@/components/docs/code-block"
import { CodeTabs } from "@/components/docs/code-tabs"
import { ComponentCard } from "@/components/docs/component-card"
import { ComponentPreview } from "@/components/docs/component-preview"
import { ComponentTabs } from "@/components/docs/component-tabs"
import { CopyButton } from "@/components/docs/copy-button"
import { CopyPromptButton } from "@/components/docs/copy-prompt-button"
import { DocsBreadcrumbs } from "@/components/docs/docs-breadcrumbs"
import { DocsShell } from "@/components/docs/docs-shell"
import {
  dependencyCommands,
  PackageManagerTabs,
  shadcnCommands,
} from "@/components/docs/package-manager-tabs"
import { PreviousNextNavigation } from "@/components/docs/prev-next-navigation"
import { PropsTable } from "@/components/docs/props-table"
import { TableOfContents } from "@/components/docs/table-of-contents"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated, getSiblings } from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { formatDate } from "@/lib/utils"
import type { TocEntry } from "@/lib/mdx/source"

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
        <DocsBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Components", href: "/components" },
            { label: component.category, href: `/components?category=${encodeURIComponent(component.category)}` },
            { label: component.title },
          ]}
          className="mb-5"
        />

        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{component.category}</Badge>
            <StatusBadge status={component.status} />
            <Badge variant="neutral">Added {formatDate(component.since)}</Badge>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {component.title}
            </h1>
            <p className="text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
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

          <p className="text-pretty leading-relaxed text-muted-foreground">
            {component.overview}
          </p>
        </header>

        <section aria-labelledby="preview" className="mt-10 scroll-mt-24">
          <h2 id="preview" className="sr-only">
            Preview
          </h2>
          <ComponentTabs
            preview={
              <ComponentPreview slug={component.slug} title={component.title} />
            }
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
              <div className="flex flex-col gap-6 pt-1">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                    With the CLI
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Requires the {siteConfig.namespace} namespace in your{" "}
                    <code className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                      components.json
                    </code>{" "}
                    — see{" "}
                    <Link
                      href="/docs/registry-setup"
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      registry setup
                    </Link>
                    .
                  </p>
                  <PackageManagerTabs
                    commands={shadcnCommands(registryTarget)}
                    label="Install with the shadcn CLI"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                    Without configuring a namespace
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    The registry item is a plain JSON file — point the CLI
                    straight at its URL.
                  </p>
                  <PackageManagerTabs
                    commands={shadcnCommands(registryUrl)}
                    label="Install from a URL"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                    Manually
                  </h3>
                  {component.dependencies.length > 0 ? (
                    <>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Install the dependencies, then copy the source into{" "}
                        <code className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                          {primary.target}
                        </code>
                        .
                      </p>
                      <PackageManagerTabs
                        commands={dependencyCommands(component.dependencies)}
                        label="Install dependencies"
                      />
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      No dependencies to install. Copy the source into{" "}
                      <code className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                        {primary.target}
                      </code>{" "}
                      and you are done.
                    </p>
                  )}
                  <CodeBlock
                    code={primary.content}
                    language={primary.language}
                    title={primary.target}
                    collapsible
                    collapsedHeight={280}
                  />
                </div>
              </div>
            }
            prompt={
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    A structured brief for Cursor, Claude Code, Codex or any
                    other coding agent. It is generated from this component&apos;s
                    metadata and its real source file, so it can never describe a
                    prop that does not exist.
                  </p>
                  <CopyPromptButton
                    prompt={prompt}
                    componentName={component.title}
                  />
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
            Install {component.title} with the shadcn CLI. The registry item
            resolves its own dependencies and writes the file to{" "}
            <code className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
              {primary.target}
            </code>
            .
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Package aria-hidden="true" className="size-4 text-muted-foreground" />
                npm packages
              </h3>
              {component.dependencies.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {component.dependencies.map((dependency) => (
                    <li key={dependency}>
                      <Badge variant="neutral" size="md" className="font-mono">
                        {dependency}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  None — this component only needs React and Tailwind.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Puzzle aria-hidden="true" className="size-4 text-muted-foreground" />
                Registry items
              </h3>
              {component.registryDependencies.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {component.registryDependencies.map((dependency) => (
                    <li key={dependency}>
                      <Badge variant="neutral" size="md" className="font-mono">
                        {dependency}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">None.</p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Installed automatically by the CLI when they are missing.
              </p>
            </div>
          </div>
        </Section>

        <Section id="accessibility" title="Accessibility">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground marker:text-border-strong">
            {component.accessibility.map((note) => (
              <li key={note} className="leading-[1.75]">
                {note}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="keyboard" title="Keyboard interactions">
          {component.keyboard.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Keyboard interactions for {component.title}
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Key
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Behaviour
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {component.keyboard.map((entry) => (
                    <tr
                      key={entry.keys.join("-")}
                      className="border-b border-border align-top last:border-0"
                    >
                      <th scope="row" className="whitespace-nowrap px-4 py-3 text-left">
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
            <p className="text-muted-foreground">
              {component.title} renders no interactive controls of its own, so it
              adds nothing to the tab order.
            </p>
          )}
        </Section>

        <Section id="customization" title="Customization">
          <div className="flex flex-col gap-6">
            {component.customization.map((example) => (
              <div key={example.title} className="flex flex-col gap-1.5">
                <h3 className="text-[0.9375rem] font-semibold tracking-tight">
                  {example.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {example.description}
                </p>
                <CodeBlock
                  code={example.code}
                  language={example.language ?? "tsx"}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </Section>

        <Section id="related" title="Related components">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="flex">
                <ComponentCard
                  item={toCatalogItem(item)}
                  layout="list"
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </Section>

        <PreviousNextNavigation
          className="mt-12"
          label="Component navigation"
          previous={
            previous ? { title: previous.title, href: `/components/${previous.slug}` } : undefined
          }
          next={next ? { title: next.title, href: `/components/${next.slug}` } : undefined}
        />
      </DocsShell>
    </>
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
      className="mt-10 scroll-mt-24 border-t border-border pt-8"
    >
      <h2 id={id} className="mb-4 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-3 leading-[1.75] text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
