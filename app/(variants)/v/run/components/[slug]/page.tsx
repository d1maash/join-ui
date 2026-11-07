import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Maximize2 } from "lucide-react"

import {
  CommandSwitch,
  ExpandList,
  ReadMore,
  RunPreview,
  RunThumb,
} from "@/components/variants/run/bits"
import { RunCode } from "@/components/variants/run/code"
import { ComponentWindow } from "@/components/variants/run/component-window"
import { RunCopy } from "@/components/variants/run/copy"
import { LocalBar } from "@/components/variants/run/local-bar"
import { PrevNext } from "@/components/variants/run/prev-next"
import { SourceList } from "@/components/variants/run/source-list"
import { MiniWindow } from "@/components/variants/run/window"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import {
  allComponents,
  getComponent,
  getRelated,
  getSiblings,
} from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"
import type { PropDefinition } from "@/types/registry"

interface PageProps {
  params: Promise<{ slug: string }>
}

const href = (path: string) => variantHref("run", path)

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Component not found" }
  return {
    title: component.title,
    description: component.description,
    robots: { index: false, follow: false },
  }
}

const TOC = [
  { id: "overview", title: "Overview" },
  { id: "usage", title: "Usage" },
  { id: "props", title: "Props" },
  { id: "dependencies", title: "Dependencies" },
  { id: "accessibility", title: "Accessibility" },
  { id: "keyboard", title: "Keyboard" },
  { id: "customization", title: "Customization" },
  { id: "related", title: "Related" },
]

/** The first sentence, and the rest — the overview is set Linear's way. */
function splitFirst(text: string): [string, string] {
  const match = /^(.+?[.!?])\s+(.*)$/s.exec(text)
  return match ? [match[1]!, match[2]!] : [text, ""]
}

/** The rest of the overview, cut at the sentence that takes it past the budget. */
function splitAtWords(text: string, budget: number): [string, string] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const shown: string[] = []
  let words = 0
  for (const sentence of sentences) {
    const count = sentence.split(/\s+/).length
    if (shown.length > 0 && words + count > budget) break
    shown.push(sentence)
    words += count
  }
  return [shown.join(" "), sentences.slice(shown.length).join(" ")]
}

export default async function RunComponentPage({ params }: PageProps) {
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
  const [lead, rest] = splitFirst(component.overview)
  const [restShown, restHidden] = splitAtWords(rest, 120 - lead.split(/\s+/).length)

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
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocalBar
        sentinel="run-head-end"
        title={component.title}
        category={component.category}
        install={component.installCommand}
        prompt={prompt}
      />

      <main id="main-content" className="run-container pt-14">
        <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <SourceList current={`/components/${component.slug}`} />

          <div className="min-w-0">
            {/* ─── The head ─────────────────────────────────────────────── */}
            <header className="pt-12 pb-10 md:pt-20 md:pb-14">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#77777c]">
                <Link href={href("/components")} className="hover:text-[#f5f5f7]">
                  Components
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  href={href(`/components?category=${encodeURIComponent(component.category)}`)}
                  className="hover:text-[#f5f5f7]"
                >
                  {component.category}
                </Link>
                {component.status !== "stable" ? (
                  <span className="run-chip" data-tone="running">
                    {component.status}
                  </span>
                ) : null}
              </p>
              <h1 className="mt-5 text-[clamp(3rem,7vw,6.5rem)] leading-[0.98] font-semibold tracking-[-0.022em]">
                {component.title}
              </h1>
              <p className="mt-6 max-w-[40rem] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-[1.45] tracking-[-0.012em] text-[#8b8b90] text-pretty">
                {component.description}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-2">
                <RunCopy
                  value={prompt}
                  label="Copy prompt"
                  variant="primary"
                  icon="prompt"
                  toastMessage={`${component.title} prompt copied`}
                />
                <RunCopy
                  value={component.installCommand}
                  label="Copy install"
                  variant="quiet"
                  toastMessage="Install command copied"
                />
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="run-btn run-btn--ghost"
                >
                  <ExternalLink aria-hidden="true" />
                  View source
                  <span className="sr-only">on GitHub (opens in a new tab)</span>
                </a>
                <Link href={`/preview/${component.slug}`} className="run-btn run-btn--ghost">
                  <Maximize2 aria-hidden="true" />
                  Full preview
                </Link>
              </div>
              <div id="run-head-end" aria-hidden="true" />
            </header>

            {/* ─── The window ───────────────────────────────────────────── */}
            <section aria-label={`${component.title}, live`}>
              <ComponentWindow
                title={primary.name}
                fullPreview={`/preview/${component.slug}`}
                tabs={[
                  {
                    id: "preview",
                    label: "Preview",
                    content: (
                      <div className="flex min-h-[34rem] items-center justify-center px-4 py-10 sm:px-8 md:px-12 md:py-14">
                        <RunPreview slug={component.slug} />
                      </div>
                    ),
                  },
                  {
                    id: "code",
                    label: "Code",
                    content: (
                      <div className="flex flex-col">
                        {sources.map((source) => (
                          <RunCode
                            key={source.path}
                            code={source.content}
                            language={source.language}
                            title={source.target}
                            numbers
                            maxHeight={640}
                            className="rounded-none !shadow-none"
                          />
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "install",
                    label: "Install",
                    content: (
                      <div className="flex max-w-[46rem] flex-col gap-10 px-5 py-8 md:px-10 md:py-10">
                        <Step
                          no="A"
                          title="With the CLI"
                          body={
                            <>
                              Needs the <code>{siteConfig.namespace}</code> namespace in your{" "}
                              <code>components.json</code> —{" "}
                              <Link href={href("/docs/registry-setup")} className="run-link">
                                registry setup
                              </Link>
                              .
                            </>
                          }
                        >
                          <CommandSwitch
                            commands={shadcnCommands(registryTarget)}
                            label="Package manager"
                          />
                        </Step>
                        <Step
                          no="B"
                          title="Straight from the URL"
                          body="The registry item is a plain JSON file. Point the CLI at it and skip the namespace."
                        >
                          <CommandSwitch
                            commands={shadcnCommands(registryUrl)}
                            label="Package manager"
                          />
                        </Step>
                        <Step
                          no="C"
                          title="By hand"
                          body={
                            component.dependencies.length > 0 ? (
                              <>
                                Install what it depends on, then copy the source into{" "}
                                <code>{primary.target}</code>.
                              </>
                            ) : (
                              <>
                                Nothing to install. Copy the source into{" "}
                                <code>{primary.target}</code>.
                              </>
                            )
                          }
                        >
                          {component.dependencies.length > 0 ? (
                            <CommandSwitch
                              commands={dependencyCommands(component.dependencies)}
                              label="Package manager"
                            />
                          ) : null}
                          <div className="run-code flex flex-wrap items-center gap-3 px-4 py-3">
                            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#f5f5f7]">
                              {primary.target}
                            </span>
                            <span className="text-[13px] text-[#77777c] max-sm:hidden">
                              {primary.content.trimEnd().split("\n").length} lines — the
                              listing is under Code
                            </span>
                            <RunCopy
                              value={primary.content}
                              label="Copy source"
                              size="sm"
                              variant="quiet"
                              toastMessage={`${primary.name} copied`}
                            />
                          </div>
                        </Step>
                      </div>
                    ),
                  },
                  {
                    id: "prompt",
                    label: "Prompt",
                    content: (
                      <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <p className="max-w-[34rem] text-[15px] leading-[1.6] text-[#8b8b90]">
                            <span className="text-[#f5f5f7]">A brief for a coding agent.</span>{" "}
                            Built from this component’s metadata and its real source file, so it
                            cannot describe a prop that does not exist.
                          </p>
                          <RunCopy
                            value={prompt}
                            label="Copy prompt"
                            variant="primary"
                            icon="prompt"
                            toastMessage={`${component.title} prompt copied`}
                          />
                        </div>
                        <RunCode
                          code={prompt}
                          language="text"
                          title={`${component.slug}.prompt.txt`}
                          maxHeight={460}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </section>

            {/* ─── The reading column ───────────────────────────────────── */}
            <div className="mt-20 grid gap-16 md:mt-28 xl:grid-cols-[minmax(0,44rem)_minmax(0,1fr)]">
              <article className="run-doc flex min-w-0 flex-col gap-20 md:gap-24">
                <section id="overview" aria-label="Overview" className="flex scroll-mt-32 flex-col gap-6">
                  <p className="!text-[clamp(1.5rem,2.3vw,1.875rem)] !leading-[1.3] !tracking-[-0.02em] !text-[#f5f5f7] text-pretty">
                    {lead}
                  </p>
                  {rest ? (
                    <ReadMore
                      className="max-w-[62ch] [&>p]:!text-[1.0625rem] [&>p]:!leading-[1.6] [&>p]:text-pretty"
                      shown={<Inline text={restShown} />}
                      rest={restHidden ? <Inline text={restHidden} /> : null}
                    />
                  ) : null}
                </section>

                <Section id="usage" title="Usage">
                  <RunCode code={component.usage} language="tsx" title="example.tsx" />
                </Section>

                <Section id="props" title="Props">
                  <div className="flex flex-col gap-12">
                    {component.props.map((group) => (
                      <div key={group.name} className="flex flex-col gap-4">
                        {component.props.length > 1 ? (
                          <div className="flex flex-col gap-1">
                            <h3 className="font-mono !text-[15px]">{group.name}</h3>
                            {group.description ? (
                              <p className="!text-[14px]">{group.description}</p>
                            ) : null}
                          </div>
                        ) : null}
                        <PropList props={group.props} name={group.name} />
                      </div>
                    ))}
                  </div>
                </Section>

                <Section id="dependencies" title="Dependencies">
                  <div className="grid gap-px overflow-hidden rounded-[12px] bg-white/[0.08] sm:grid-cols-2">
                    <DependencyBlock
                      title="npm"
                      items={component.dependencies}
                      empty="None. React and Tailwind are all it needs."
                    />
                    <DependencyBlock
                      title="Registry"
                      items={component.registryDependencies}
                      empty="None."
                      note="The CLI installs these when they are missing."
                    />
                  </div>
                </Section>

                <Section id="accessibility" title="Accessibility">
                  <ExpandList
                    className="flex flex-col"
                    noun="notes"
                    items={component.accessibility.map((note, index) => (
                      <li
                        key={note}
                        className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-t border-white/[0.08] py-4 first:border-t-0 first:pt-0"
                      >
                        <span className="run-index pt-[0.3rem]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <Inline text={note} />
                        </span>
                      </li>
                    ))}
                  />
                </Section>

                <Section id="keyboard" title="Keyboard">
                  {component.keyboard.length > 0 ? (
                    <ul className="flex flex-col">
                      {component.keyboard.map((entry) => (
                        <li
                          key={entry.keys.join("+")}
                          className="grid gap-3 border-t border-white/[0.08] py-4 first:border-t-0 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                        >
                          <span className="flex flex-wrap items-center gap-1.5">
                            {entry.keys.map((key) => (
                              <kbd key={key} className="run-key">
                                {key}
                              </kbd>
                            ))}
                          </span>
                          <span className="text-[15px] leading-[1.6] text-[#8b8b90]">
                            <Inline text={entry.description} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {component.title} draws no controls of its own, so it adds nothing to the
                      tab order and needs no keys.
                    </p>
                  )}
                </Section>

                <Section id="customization" title="Customization">
                  <div className="flex flex-col gap-12">
                    {component.customization.map((example) => (
                      <div key={example.title} className="flex flex-col gap-3">
                        <h3>{example.title}</h3>
                        <p>
                          <Inline text={example.description} />
                        </p>
                        <RunCode
                          code={example.code}
                          language={example.language ?? "tsx"}
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              </article>

              <aside className="hidden xl:block" aria-label="On this page">
                <nav className="sticky top-32 flex flex-col gap-1 pl-6">
                  <p className="run-label pb-2">On this page</p>
                  {TOC.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="py-1 text-[13px] text-[#8b8b90] transition-colors hover:text-[#f5f5f7]"
                    >
                      {entry.title}
                    </a>
                  ))}
                </nav>
              </aside>
            </div>

            {/* ─── Related, and the way on ──────────────────────────────── */}
            {related.length > 0 ? (
              <section id="related" aria-labelledby="related-title" className="mt-28 scroll-mt-32">
                <h2
                  id="related-title"
                  className="text-[1.5rem] leading-[1.25] font-semibold tracking-[-0.02em]"
                >
                  Works well with
                </h2>
                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={href(`/components/${item.slug}`)} className="group block rounded-[12px]">
                        <MiniWindow title={item.title}>
                          <RunThumb slug={item.slug} scale={0.6} height={204} />
                        </MiniWindow>
                        <span className="mt-3 block text-[15px] font-medium text-[#f5f5f7] group-hover:underline group-hover:underline-offset-4">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-[13px] leading-[1.5] text-[#8b8b90]">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <PrevNext
              className="mt-24"
              label="Component navigation"
              previous={
                previous
                  ? { title: previous.title, href: href(`/components/${previous.slug}`) }
                  : undefined
              }
              next={
                next ? { title: next.title, href: href(`/components/${next.slug}`) } : undefined
              }
            />
          </div>
        </div>
      </main>
    </>
  )
}

/* ─── Pieces ──────────────────────────────────────────────────────────────── */

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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <h2 id={`${id}-title`} className="mb-7">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Step({
  no,
  title,
  body,
  children,
}: {
  no: string
  title: string
  body: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="run-doc grid gap-4 sm:grid-cols-[2rem_minmax(0,1fr)]">
      <span className="run-index pt-1">{no}</span>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3>{title}</h3>
          <p className="!text-[14px]">{body}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Backticks in the metadata become code, the way they read in the source. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={index}>{part.slice(1, -1)}</code>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

function PropList({ props, name }: { props: PropDefinition[]; name: string }) {
  return (
    <dl className="flex flex-col" aria-label={`${name} props`}>
      {props.map((prop) => (
        <div
          key={prop.name}
          className="grid gap-2 border-t border-white/[0.08] py-4 first:border-t-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-8"
        >
          <dt className="flex min-w-0 flex-col gap-1">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[14px] font-medium text-[#f5f5f7]">{prop.name}</span>
              {prop.required ? (
                <span className="text-[11px] font-medium text-[#ffb340]">required</span>
              ) : null}
            </span>
            <span className="font-mono text-[12px] leading-[1.5] break-words text-[#8b8b90]">
              {prop.type}
            </span>
            {prop.defaultValue ? (
              <span className="font-mono text-[12px] text-[#77777c]">= {prop.defaultValue}</span>
            ) : null}
          </dt>
          <dd className="text-[14px] leading-[1.6] text-[#8b8b90]">
            <Inline text={prop.description} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DependencyBlock({
  title,
  items,
  empty,
  note,
}: {
  title: string
  items: string[]
  empty: string
  note?: string
}) {
  return (
    <div className="flex flex-col gap-3 bg-[#060607] p-5">
      <h3 className="!text-[13px] !font-normal text-[#77777c]">{title}</h3>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item} className="font-mono !text-[14px] !text-[#f5f5f7]">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="!text-[14px]">{empty}</p>
      )}
      {note ? <p className="mt-auto !text-[12px] !text-[#77777c]">{note}</p> : null}
    </div>
  )
}
