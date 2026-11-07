import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Bot, ExternalLink, Package } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { CodeTabs } from "@/components/site/code-tabs"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlagBadge, MetaBadge } from "@/components/variants/studio/badges"
import { ComponentCard } from "@/components/variants/studio/component-card"
import { componentMarkdown, formatDate, getFlag } from "@/components/variants/studio/data"
import { ContributeLinks, DocHeader, DocSection, PrevNext, SubHeading } from "@/components/variants/studio/doc-parts"
import { categoryHref, categorySlug, sh } from "@/components/variants/studio/href"
import { PagePromptButton, PromptProvider } from "@/components/variants/studio/page-prompt"
import { PreviewFrame } from "@/components/variants/studio/preview-frame"
import { AccessibilityList, KeyboardTable, PropsReference } from "@/components/variants/studio/reference"
import { MobileToc, Toc } from "@/components/variants/studio/toc"
import type { StudioItem, TocItem } from "@/components/variants/studio/types"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated, getSiblings } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { slugify } from "@/lib/utils"
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

function toItem(component: ComponentMetadata): StudioItem {
  return {
    key: component.slug,
    slug: component.slug,
    href: sh(`/components/${component.slug}`),
    title: component.title,
    description: component.description,
    category: component.category,
    categorySlug: categorySlug(component.category),
    tags: component.tags,
    status: component.status,
    flag: getFlag(component),
    featured: component.featured,
    since: component.since,
    dependencies: component.dependencies,
  }
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-[0.4em] py-[0.15em] text-[0.85em] text-foreground">{children}</code>
  )
}

export default async function StudioComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component, 3)
  const siblings = getSiblings(component.slug)
  const previous = siblings.previous
    ? { title: siblings.previous.title, href: sh(`/components/${siblings.previous.slug}`) }
    : undefined
  const next = siblings.next
    ? { title: siblings.next.title, href: sh(`/components/${siblings.next.slug}`) }
    : undefined

  const flag = getFlag(component)
  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`
  const issueUrl = `${siteConfig.links.issues}/new?title=${encodeURIComponent(`[${component.title}] `)}`

  const exampleIds = component.customization.map((example) => `example-${slugify(example.title)}`)
  const toc: TocItem[] = [
    { id: "installation", title: "Installation", level: 2 },
    { id: "usage", title: "Usage", level: 2 },
    ...(component.customization.length > 0
      ? [
          { id: "examples", title: "Examples", level: 2 as const },
          ...component.customization.map((example, index) => ({
            id: exampleIds[index] ?? `example-${index}`,
            title: example.title,
            level: 3 as const,
          })),
        ]
      : []),
    { id: "api-reference", title: "API reference", level: 2 },
    ...(component.accessibility.length > 0
      ? [{ id: "accessibility", title: "Accessibility", level: 2 as const }]
      : []),
    ...(component.keyboard.length > 0 ? [{ id: "keyboard", title: "Keyboard", level: 2 as const }] : []),
    { id: "dependencies", title: "Dependencies", level: 2 },
    ...(related.length > 0 ? [{ id: "related", title: "Related", level: 2 as const }] : []),
  ]

  return (
    <PromptProvider prompt={prompt} title={component.title}>
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13.5rem] xl:gap-12">
        <main id="main-content" className="min-w-0 pt-8 pb-8">
          <MobileToc items={toc} />

          <DocHeader
            crumbs={[
              { label: "Components", href: sh("/components") },
              { label: component.category, href: categoryHref(component.category) },
              { label: component.title },
            ]}
            title={component.title}
            description={component.description}
            markdown={componentMarkdown(component)}
            previous={previous}
            next={next}
          >
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <FlagBadge flag={flag} className="h-6 px-2 text-xs" />
              <MetaBadge>{component.category}</MetaBadge>
              <MetaBadge>
                <Package aria-hidden="true" className="size-3" />
                {component.dependencies.length === 0
                  ? "No dependencies"
                  : component.dependencies.join(", ")}
              </MetaBadge>
              <span className="text-xs text-muted-foreground">
                Added {formatDate(component.since)}
                {component.updated ? ` · updated ${formatDate(component.updated)}` : ""}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <PagePromptButton variant="primary" size="sm" />
              </span>
            </div>
          </DocHeader>

          <div className="mt-8">
            <PreviewFrame
              slug={component.slug}
              title={component.title}
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
                        collapsedHeight={460}
                        showLineNumbers
                      />
                    ),
                  }))}
                />
              }
            />
          </div>

          <p className="mt-8 max-w-[44rem] text-[15px] leading-7 text-pretty text-[var(--st-prose)]">
            {component.overview}
          </p>

          <DocSection id="installation" title="Installation">
            <Tabs defaultValue="cli">
              <TabsList aria-label="Installation method">
                <TabsTrigger value="cli">CLI</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="cli" className="flex flex-col gap-4">
                <PackageManagerTabs commands={shadcnCommands(registryTarget)} label="Install with the shadcn CLI" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Needs the <Code>{siteConfig.namespace}</Code> namespace in{" "}
                  <Code>components.json</Code> — see{" "}
                  <Link href={sh("/docs/registry-setup")} className="font-medium text-foreground underline underline-offset-4">
                    registry setup
                  </Link>
                  . Without it, point the CLI at the item&apos;s URL:
                </p>
                <PackageManagerTabs commands={shadcnCommands(registryUrl)} label="Install from the registry URL" />
              </TabsContent>
              <TabsContent value="manual">
                <ol className="st-steps ml-3.5 border-l border-border">
                  <ManualStep title={component.dependencies.length > 0 ? "Install the dependencies" : "No dependencies"}>
                    {component.dependencies.length > 0 ? (
                      <PackageManagerTabs
                        commands={dependencyCommands(component.dependencies)}
                        label="Install dependencies"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {component.title} only needs React and Tailwind CSS.
                      </p>
                    )}
                  </ManualStep>
                  <ManualStep title="Copy the source into your project">
                    <p className="text-sm text-muted-foreground">
                      Save it as <Code>{primary.target}</Code>.
                    </p>
                    <CodeBlock
                      code={primary.content}
                      language={primary.language}
                      title={primary.target}
                      collapsible
                      collapsedHeight={300}
                    />
                  </ManualStep>
                  <ManualStep title="Update the import paths">
                    <p className="text-sm text-muted-foreground">
                      Match the <Code>@/lib/utils</Code> alias to your project setup.
                    </p>
                  </ManualStep>
                </ol>
              </TabsContent>
            </Tabs>
          </DocSection>

          <DocSection id="usage" title="Usage">
            <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
          </DocSection>

          {component.customization.length > 0 ? (
            <DocSection
              id="examples"
              title="Examples"
              description={`${component.customization.length} ways to adapt ${component.title} — each one a change to the props or the source you now own.`}
            >
              <div className="flex flex-col gap-10">
                {component.customization.map((example, index) => (
                  <div key={example.title} className="flex flex-col gap-2">
                    <SubHeading id={exampleIds[index] ?? `example-${index}`}>{example.title}</SubHeading>
                    <p className="max-w-[44rem] text-sm leading-relaxed text-pretty text-muted-foreground">
                      {example.description}
                    </p>
                    <CodeBlock code={example.code} language={example.language ?? "tsx"} className="mt-2" />
                  </div>
                ))}
              </div>
            </DocSection>
          ) : null}

          <DocSection id="api-reference" title="API reference">
            <PropsReference groups={component.props} idPrefix="api" />
          </DocSection>

          {component.accessibility.length > 0 ? (
            <DocSection id="accessibility" title="Accessibility">
              <AccessibilityList notes={component.accessibility} />
            </DocSection>
          ) : null}

          {component.keyboard.length > 0 ? (
            <DocSection id="keyboard" title="Keyboard">
              <KeyboardTable entries={component.keyboard} title={component.title} />
            </DocSection>
          ) : null}

          <DocSection id="dependencies" title="Dependencies">
            <div className="grid gap-3 sm:grid-cols-2">
              <DependencyList
                title="npm packages"
                empty="None — React and Tailwind CSS only."
                items={component.dependencies.map((name) => ({
                  name,
                  href: `https://www.npmjs.com/package/${name}`,
                }))}
              />
              <DependencyList
                title="Registry items"
                empty="None."
                note="Installed by the CLI when they are missing."
                items={component.registryDependencies.map((name) => {
                  const local = getComponent(name)
                  return { name, href: local ? sh(`/components/${local.slug}`) : undefined }
                })}
              />
            </div>
          </DocSection>

          {related.length > 0 ? (
            <DocSection id="related" title="Related">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.slug} className="flex">
                    <ComponentCard item={toItem(item)} compact className="w-full" />
                  </li>
                ))}
              </ul>
            </DocSection>
          ) : null}

          <PrevNext previous={previous} next={next} />
        </main>

        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-8 xl:block">
          <Toc items={toc}>
            <div className="rounded-lg border border-border bg-subtle p-3.5">
              <p className="flex items-center gap-1.5 text-[13px] font-medium">
                <Bot aria-hidden="true" className="size-3.5 text-muted-foreground" />
                Using an agent?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Copy a complete brief for {component.title} — props, rules and the full source.
              </p>
              <div className="mt-3">
                <PagePromptButton variant="secondary" size="sm" />
              </div>
            </div>
            <ContributeLinks
              editUrl={`${siteConfig.links.repo}/blob/main/lib/registry/components.ts`}
              issueUrl={issueUrl}
              sourceUrl={sourceUrl}
            />
          </Toc>
        </aside>
      </div>
    </PromptProvider>
  )
}

function ManualStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="st-step relative flex flex-col gap-3 pb-8 pl-7 last:pb-1 before:absolute before:top-0 before:-left-[13px] before:flex before:size-[26px] before:items-center before:justify-center before:rounded-full before:border before:border-border before:bg-background before:text-xs before:font-semibold before:text-foreground">
      <p className="pt-0.5 text-[15px] font-semibold tracking-[-0.012em]">{title}</p>
      {children}
    </li>
  )
}

function DependencyList({
  title,
  items,
  empty,
  note,
}: {
  title: string
  items: Array<{ name: string; href?: string }>
  empty: string
  note?: string
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[13px] font-medium">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item.name}>
              {item.href ? (
                <a
                  href={item.href}
                  {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-subtle px-2 font-mono text-[12.5px] transition-colors hover:border-border-hover hover:bg-muted"
                >
                  {item.name}
                  {item.href.startsWith("http") ? (
                    <ExternalLink aria-hidden="true" className="size-3 text-muted-foreground" />
                  ) : null}
                </a>
              ) : (
                <span className="inline-flex h-7 items-center rounded-md border border-border bg-subtle px-2 font-mono text-[12.5px]">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
      {note ? <p className="mt-3 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}
