import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { CodeTabs } from "@/components/site/code-tabs"
import { CopyButton } from "@/components/site/copy-button"
import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { AppFrame, LiveCanvas, Overview } from "@/components/variants/desktop/app-frame"
import { AppIcon } from "@/components/variants/desktop/app-icon"
import { isComponentSlug, tagColour, vh } from "@/components/variants/desktop/apps"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import {
  allComponents,
  componentsByName,
  getComponent,
  getRelated,
  getSiblings,
} from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import type { ComponentMetadata, PropGroup } from "@/types/registry"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Page not found" }
  return {
    title: component.title,
    description: component.description,
    robots: { index: false, follow: false },
  }
}

const STATUS_LABEL: Record<ComponentMetadata["status"], string> = {
  stable: "Stable",
  new: "New",
  updated: "Updated",
  experimental: "Experimental",
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" })

/*
 * A component page is the component's app, opened and maximised: see
 * `AppFrame` for the window. Everything the original page carries is here —
 * preview, source, the three ways to install, usage, props, dependencies,
 * accessibility, keyboard, customisation, Copy prompt, related, previous and
 * next — sorted into the places a Mac app keeps such things: views in the
 * toolbar, facts in the inspector, the rest below the view.
 */
export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component || !isComponentSlug(component.slug)) notFound()

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
  }

  const categories = [...new Set(componentsByName.map((item) => item.category))]

  const sidebar = (
    <div>
      <p className="d-source-head">Join UI</p>
      <ul>
        <li>
          <Link href={vh("/")} className="d-source-row">
            <AppIcon id="about" className="size-[18px]" />
            Desktop
          </Link>
        </li>
        <li>
          <Link href={vh("/components")} className="d-source-row">
            <AppIcon id="catalog" className="size-[18px]" />
            Catalog
          </Link>
        </li>
        <li>
          <Link href={vh("/docs")} className="d-source-row">
            <AppIcon id="docs" className="size-[18px]" />
            Docs
          </Link>
        </li>
      </ul>
      {categories.map((category) => (
        <div key={category}>
          <p className="d-source-head">
            <span className="size-2 rounded-full" style={{ background: tagColour(category) }} aria-hidden="true" />
            {category}
          </p>
          <ul>
            {componentsByName
              .filter((item) => item.category === category)
              .map((item) => {
                const current = item.slug === component.slug
                return (
                  <li key={item.slug}>
                    <Link
                      href={vh(`/components/${item.slug}`)}
                      aria-current={current ? "page" : undefined}
                      className="d-source-row"
                    >
                      {isComponentSlug(item.slug) ? (
                        <AppIcon id={item.slug} className="size-[18px]" />
                      ) : null}
                      {item.title}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </div>
  )

  const views = {
    preview: (
      <div>
        <h2 className="sr-only">Preview</h2>
        <LiveCanvas slug={component.slug} />
      </div>
    ),
    code: (
      <div className="d-code-host flex flex-col gap-4">
        <ViewHead
          title="Source"
          text={
            <>
              The file the CLI writes to <Code>{primary.target}</Code>. It is yours from the moment it lands.
            </>
          }
          action={
            <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="d-btn">
              View on GitHub
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          }
        />
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
                collapsedHeight={520}
                showLineNumbers
              />
            ),
          }))}
        />
      </div>
    ),
    install: (
      <div className="d-code-host flex flex-col gap-4">
        <ViewHead title="Installation" text="Three ways in. All of them end with the same file in your project." />
        <div className="d-group">
          <InstallStep
            n={1}
            title="With the CLI"
            text={
              <>
                Needs the <Code>{siteConfig.namespace}</Code> namespace in <Code>components.json</Code> —{" "}
                <Link href={vh("/docs/registry-setup")} className="d-link">
                  registry setup
                </Link>
                .
              </>
            }
          >
            <PackageManagerTabs commands={shadcnCommands(registryTarget)} label="Install with the shadcn CLI" />
          </InstallStep>
          <InstallStep n={2} title="From the URL" text="No namespace needed. The registry item is a plain JSON file.">
            <PackageManagerTabs commands={shadcnCommands(registryUrl)} label="Install from a URL" />
          </InstallStep>
          <InstallStep
            n={3}
            title="By hand"
            text={
              component.dependencies.length > 0 ? (
                <>
                  Install the dependencies, then copy the source into <Code>{primary.target}</Code>.
                </>
              ) : (
                <>
                  Nothing to install. Copy the source into <Code>{primary.target}</Code> and you are done.
                </>
              )
            }
          >
            {component.dependencies.length > 0 ? (
              <PackageManagerTabs commands={dependencyCommands(component.dependencies)} label="Install dependencies" />
            ) : null}
            <CodeBlock
              code={primary.content}
              language={primary.language}
              title={primary.target}
              collapsible
              collapsedHeight={240}
            />
          </InstallStep>
        </div>
      </div>
    ),
    props: (
      <div className="flex flex-col gap-4">
        <ViewHead title="Props" text="Everything the component takes, straight from its definition. Required props are marked." />
        <MacPropsTable groups={component.props} />
      </div>
    ),
    prompt: (
      <div className="d-code-host flex flex-col gap-4">
        <ViewHead
          title="Prompt"
          text="A brief for Cursor, Claude Code, Codex or any coding agent. It is built from this component's metadata and its real source, so it cannot describe a prop that does not exist."
          action={
            <span className="d-tb-prompt">
              <CopyPromptButton prompt={prompt} componentName={component.title} />
            </span>
          }
        />
        <CodeBlock
          code={prompt}
          language="text"
          title={`${component.slug}.prompt.txt`}
          collapsible
          collapsedHeight={560}
        />
      </div>
    ),
  }

  const below = (
    <div className="d-code-host mt-8 flex flex-col gap-12">
      <Overview text={component.overview} />

      <Section id="accessibility" title="Accessibility">
        <ul className="flex max-w-[62ch] flex-col gap-2.5 text-[15px] leading-[1.6] text-[var(--d-ink-2)]">
          {component.accessibility.map((note) => (
            <li key={note} className="flex gap-3">
              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[var(--d-blue)]" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
      </Section>

      <Section id="customization" title="Customization">
        <div className="flex flex-col gap-8">
          {component.customization.map((example) => (
            <div key={example.title} className="flex flex-col gap-2">
              <h3 className="text-[15px] font-semibold tracking-[-0.012em]">{example.title}</h3>
              <p className="max-w-[62ch] text-[14px] leading-[1.6] text-[var(--d-ink-2)]">{example.description}</p>
              <CodeBlock code={example.code} language={example.language ?? "tsx"} className="mt-1" />
            </div>
          ))}
        </div>
      </Section>

      {related.length > 0 ? (
        <Section id="related" title="Related">
          <ul className="grid gap-2 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={vh(`/components/${item.slug}`)} className="d-related">
                  {isComponentSlug(item.slug) ? <AppIcon id={item.slug} className="size-10 shrink-0" /> : null}
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">{item.title}</span>
                    <span className="line-clamp-2 text-[12.5px] leading-snug text-[var(--d-ink-3)]">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <nav aria-label="Component navigation" className="flex items-stretch justify-between gap-3 border-t border-[var(--d-hair)] pt-5 pb-2">
        {previous ? (
          <Link href={vh(`/components/${previous.slug}`)} className="d-pn">
            <ChevronLeft aria-hidden="true" className="size-4" />
            <span>
              <span className="block text-[11.5px] text-[var(--d-ink-3)]">Previous</span>
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={vh(`/components/${next.slug}`)} className="d-pn text-right">
            <span>
              <span className="block text-[11.5px] text-[var(--d-ink-3)]">Next</span>
              {next.title}
            </span>
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </nav>
    </div>
  )

  const inspector = (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <AppIcon id={component.slug} className="size-14 shrink-0 drop-shadow-[0_6px_12px_rgb(0_0_0/0.4)]" />
        <div className="min-w-0 pt-0.5">
          <p className="text-[17px] font-semibold tracking-[-0.02em]">{component.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="d-chip">{STATUS_LABEL[component.status]}</span>
            {component.updated ? <span className="d-chip">Updated {DATE.format(new Date(component.updated))}</span> : null}
          </p>
        </div>
      </div>

      <section aria-labelledby="installation">
        <h2 id="installation" className="d-ins-head">
          Install
        </h2>
        <div className="flex items-center gap-1 rounded-[10px] bg-black/35 py-1 pr-1 pl-3 shadow-[inset_0_0_0_0.5px_rgb(255_255_255/0.1)]">
          <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-[var(--d-ink-2)]">
            {component.installCommand}
          </code>
          <CopyButton
            value={component.installCommand}
            label="Copy install command"
            toastMessage="Install command copied"
          />
        </div>
      </section>

      <section aria-labelledby="dependencies">
        <h2 id="dependencies" className="d-ins-head">
          Info
        </h2>
        <dl className="d-info">
          <dt>Kind</dt>
          <dd>React component</dd>
          <dt>Category</dt>
          <dd className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: tagColour(component.category) }} aria-hidden="true" />
            {component.category}
          </dd>
          <dt>Added</dt>
          <dd>{DATE.format(new Date(component.since))}</dd>
          <dt>npm</dt>
          <dd>
            {component.dependencies.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {component.dependencies.map((dependency) => (
                  <span key={dependency} className="d-chip font-mono">
                    {dependency}
                  </span>
                ))}
              </span>
            ) : (
              "None beyond React and Tailwind"
            )}
          </dd>
          <dt>Registry</dt>
          <dd>
            {component.registryDependencies.length > 0
              ? component.registryDependencies.join(", ")
              : "None"}
          </dd>
        </dl>
      </section>

      <section aria-labelledby="keyboard">
        <h2 id="keyboard" className="d-ins-head">
          Keyboard
        </h2>
        {component.keyboard.length > 0 ? (
          <table className="w-full text-left text-[13px]">
            <caption className="sr-only">Keyboard interactions for {component.title}</caption>
            <tbody>
              {component.keyboard.map((entry) => (
                <tr key={entry.keys.join("-")} className="border-t border-[var(--d-hair)] align-top first:border-t-0">
                  <th scope="row" className="py-2 pr-3 font-normal whitespace-nowrap">
                    <span className="flex flex-wrap gap-1">
                      {entry.keys.map((key) => (
                        <kbd key={key} className="d-key font-sans">
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </th>
                  <td className="py-2 leading-[1.5] text-[var(--d-ink-2)]">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] text-[var(--d-ink-2)]">No controls of its own, so nothing joins the tab order.</p>
        )}
      </section>

      <div className="flex flex-col gap-1.5 border-t border-[var(--d-hair)] pt-4">
        <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="d-link text-[13px]">
          View source on GitHub
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <Link href={`/preview/${component.slug}`} className="d-link text-[13px]">
          Open the full-page preview
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AppFrame
        slug={component.slug}
        title={component.title}
        category={component.category}
        prompt={prompt}
        sidebar={sidebar}
        views={views}
        below={below}
        inspector={inspector}
      />
    </>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[5px] bg-white/8 px-1 py-px font-mono text-[0.86em] text-[var(--d-ink)]">
      {children}
    </code>
  )
}

function ViewHead({
  title,
  text,
  action,
}: {
  title: string
  text: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-[62ch]">
        <h2 className="text-[22px] font-semibold tracking-[-0.022em]">{title}</h2>
        <p className="mt-1 text-[14px] leading-[1.55] text-[var(--d-ink-2)]">{text}</p>
      </div>
      {action}
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-6">
      <h2 id={id} className="mb-4 text-[20px] font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  )
}

function InstallStep({
  n,
  title,
  text,
  children,
}: {
  n: number
  title: string
  text: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="d-group-row">
      <span className="d-step" aria-hidden="true">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.012em]">{title}</h3>
          <p className="mt-0.5 text-[13.5px] leading-[1.55] text-[var(--d-ink-2)]">{text}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

/* Props as a Mac list view: a header with column rules, zebra rows, mono names. */
function MacPropsTable({ groups }: { groups: PropGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-[14px] text-[var(--d-ink-2)]">This component takes no props.</p>
  }
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <div>
            <h3 className="font-mono text-[14px] font-semibold">{group.name}</h3>
            {group.description ? (
              <p className="mt-0.5 text-[13px] text-[var(--d-ink-2)]">{group.description}</p>
            ) : null}
          </div>
          <div className="d-list overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <caption className="sr-only">Props for {group.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {group.props.map((prop) => (
                  <tr key={prop.name}>
                    <th scope="row" className="font-mono font-medium whitespace-nowrap">
                      {prop.name}
                      {prop.required ? (
                        <>
                          <span aria-hidden="true" className="text-[#ff6961]">
                            {" "}
                            *
                          </span>
                          <span className="sr-only"> (required)</span>
                        </>
                      ) : null}
                    </th>
                    <td className="font-mono text-[12px] text-[#64d2ff]">{prop.type}</td>
                    <td className="font-mono text-[12px] whitespace-nowrap text-[var(--d-ink-2)]">
                      {prop.defaultValue ?? "—"}
                    </td>
                    <td className="leading-[1.5] text-[var(--d-ink-2)]">{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
