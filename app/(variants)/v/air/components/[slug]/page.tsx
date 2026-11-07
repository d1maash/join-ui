import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"

import { AirCode } from "@/components/variants/air/code"
import { AirCommand } from "@/components/variants/air/command"
import { AirCopy, AirCopyPrompt } from "@/components/variants/air/copy"
import { air } from "@/components/variants/air/href"
import { LocalNav } from "@/components/variants/air/local-nav"
import { MoreLink, PillLink } from "@/components/variants/air/pill"
import { ProductCard } from "@/components/variants/air/product-card"
import { Reveal } from "@/components/variants/air/reveal"
import { AirCodeTabs, AirStage, PromptPeek } from "@/components/variants/air/stage"
import { ticks } from "@/components/variants/air/ticks"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated, getSiblings } from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { PropGroup } from "@/types/registry"

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
  return {
    title: component.title,
    description: component.description,
  }
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "code", label: "Code" },
  { id: "install", label: "Install" },
  { id: "prompt", label: "Prompt" },
  { id: "specs", label: "Tech Specs" },
  { id: "customize", label: "Customize" },
]

/*
 * A component page, built like an Apple product page.
 *
 * The local nav sticks with the name and the one action. Then the hero — name,
 * one line, two pills — and the product itself on a big grey stage. The
 * overview reads as a single highlighted paragraph. Code, install, the agent
 * prompt, a "Tech Specs" sheet (props, dependencies, accessibility, keyboard,
 * files), customization, and related components follow, one band each.
 *
 * Dropped from the original: the second installation section (the install
 * band here is the only one), the preview/code/install/prompt tab strip (each
 * is now a band of its own, so nothing is hidden behind a tab), the badges row
 * and the breadcrumb (the breadcrumb lives in the footer, as on apple.com).
 */
export default async function AirComponentPage({ params }: PageProps) {
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
  const promptLines = prompt.trimEnd().split("\n").length

  const [lead, ...rest] = component.overview.split(/(?<=\.)\s+/)
  const eyebrow =
    component.status === "new" ? "New" : component.updated ? "Updated" : component.category

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

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LocalNav title={component.title} sections={SECTIONS} prompt={prompt} />

      {/* Hero */}
      <section id="top" aria-labelledby="component-title" className="scroll-mt-0 bg-white">
        <div className="mx-auto max-w-[75rem] px-5 pt-14 text-center sm:pt-20">
          <p
            className={cn(
              "air-rise air-eyebrow",
              eyebrow === component.category ? "text-[#6e6e73]" : "text-[#b64400]"
            )}
          >
            {eyebrow}
          </p>
          <h1
            id="component-title"
            className="air-rise air-h1 mt-2 text-[#1d1d1f]"
            style={{ ["--air-delay" as string]: "60ms" }}
          >
            {component.title}
          </h1>
          <p
            className="air-rise air-sub mx-auto mt-5 max-w-[36ch] text-balance text-[#6e6e73]"
            style={{ ["--air-delay" as string]: "140ms" }}
          >
            {component.description}
          </p>
          <div
            className="air-rise mt-9 flex flex-wrap justify-center gap-3.5"
            style={{ ["--air-delay" as string]: "220ms" }}
          >
            <AirCopyPrompt prompt={prompt} componentName={component.title} size="lg" />
            <PillLink href="#install" variant="secondary" size="lg">
              Install
            </PillLink>
          </div>
          <div
            className="air-rise mt-7 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[17px]"
            style={{ ["--air-delay" as string]: "300ms" }}
          >
            <MoreLink href={sourceUrl} external>
              View source on GitHub
            </MoreLink>
            <MoreLink href={`/preview/${component.slug}`}>Open the full preview</MoreLink>
          </div>
        </div>

        <div
          className="air-rise mx-auto mt-14 max-w-[80rem] px-2 sm:mt-16 sm:px-5"
          style={{ ["--air-delay" as string]: "380ms" }}
        >
          <h2 className="sr-only">Live preview</h2>
          <AirStage slug={component.slug} />
        </div>
      </section>

      {/* Overview */}
      <section
        id="overview"
        aria-labelledby="overview-title"
        className="scroll-mt-[60px] bg-white px-5 pt-24 pb-24 sm:pt-32 sm:pb-32"
      >
        <Reveal className="mx-auto max-w-[52rem]">
          <h2 id="overview-title" className="sr-only">
            Overview
          </h2>
          <p className="text-[clamp(1.1875rem,2.2vw,1.75rem)] leading-[1.34] font-semibold tracking-[-0.02em] text-[#86868b]">
            <span className="text-[#1d1d1f]">{lead}</span> {rest.join(" ")}
          </p>
        </Reveal>
      </section>

      {/* Code */}
      <section
        id="code"
        aria-labelledby="code-title"
        className="scroll-mt-[52px] bg-[#f5f5f7] px-5 pt-20 pb-24 sm:pt-28 sm:pb-32"
      >
        <div className="mx-auto max-w-[61rem]">
          <Reveal>
            <h2 id="code-title" className="air-h2 text-[#1d1d1f]">
              A few lines to use.
              <br />
              <span className="text-[#6e6e73]">Every line to read.</span>
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <h3 className="mb-4 text-[21px] font-semibold tracking-[-0.018em]">Usage</h3>
            <AirCode code={component.usage} language="tsx" title="example.tsx" tone="white" />
          </Reveal>
          <Reveal className="mt-12">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-[21px] font-semibold tracking-[-0.018em]">Source</h3>
              <p className="text-[14px] text-[#6e6e73]">
                Exactly what the CLI writes to{" "}
                <code className="font-mono text-[13px] text-[#1d1d1f]">{primary.target}</code>
              </p>
            </div>
            <AirCodeTabs
              label={`${component.title} source files`}
              items={sources.map((source) => ({
                value: source.name,
                label: source.name,
                content: (
                  <AirCode
                    code={source.content}
                    language={source.language}
                    title={source.target}
                    tone="white"
                    collapsible
                    collapsedHeight={520}
                    showLineNumbers
                  />
                ),
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* Install */}
      <section
        id="install"
        aria-labelledby="install-title"
        className="scroll-mt-[52px] bg-white px-5 pt-20 pb-24 sm:pt-28 sm:pb-32"
      >
        <div className="mx-auto max-w-[61rem]">
          <Reveal>
            <h2 id="install-title" className="air-h2 text-[#1d1d1f]">
              Three ways in.
            </h2>
            <p className="air-lede mt-4 max-w-[38rem] text-[#6e6e73]">
              The CLI resolves {component.title}&rsquo;s dependencies and writes one file to{" "}
              <code className="font-mono text-[0.85em] text-[#1d1d1f]">{primary.target}</code>.
              Prefer to do it yourself? That works too.
            </p>
          </Reveal>

          <ol className="mt-12 border-t border-[#d2d2d7]">
            <InstallRow
              number={1}
              title="With the CLI"
              note="Recommended"
              description={
                <>
                  Needs the {siteConfig.namespace} namespace in{" "}
                  <code className="font-mono text-[0.9em] text-[#1d1d1f]">components.json</code>
                  .{" "}
                  <MoreLink href={air("/docs/registry-setup")}>Set it up</MoreLink>
                </>
              }
            >
              <AirCommand
                commands={shadcnCommands(registryTarget)}
                tone="white"
                label="Package manager for the CLI install"
              />
            </InstallRow>
            <InstallRow
              number={2}
              title="From a URL"
              description="No namespace to configure. The registry item is a plain JSON file — point the CLI straight at it."
            >
              <AirCommand
                commands={shadcnCommands(registryUrl)}
                tone="white"
                label="Package manager for the URL install"
              />
            </InstallRow>
            <InstallRow
              number={3}
              title="By hand"
              description={
                component.dependencies.length > 0 ? (
                  "Install the dependencies, then copy the source to the same path in your project."
                ) : (
                  "Nothing to install. Copy the source to the same path in your project."
                )
              }
            >
              <div className="flex flex-col gap-4">
                {component.dependencies.length > 0 ? (
                  <AirCommand
                    commands={dependencyCommands(component.dependencies)}
                    tone="white"
                    label="Package manager for the dependencies"
                  />
                ) : null}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <AirCopy
                    value={primary.content}
                    label="Copy the source"
                    copiedLabel="Source copied"
                    toastMessage={`${component.title} source copied`}
                    variant="neutral"
                    size="md"
                  />
                  <MoreLink href="#code" className="text-[17px]">
                    Read it first
                  </MoreLink>
                </div>
              </div>
            </InstallRow>
          </ol>
        </div>
      </section>

      {/* Prompt */}
      <section
        id="prompt"
        aria-labelledby="prompt-title"
        className="dark scroll-mt-[52px] bg-black px-5 pt-20 pb-24 text-center text-[#f5f5f7] sm:pt-28 sm:pb-32"
      >
        <Reveal className="mx-auto max-w-[50rem]">
          <p className="air-eyebrow text-[#a1a1a6]">For AI coding agents</p>
          <h2 id="prompt-title" className="air-h2 mt-3">
            Hand it to your agent.
          </h2>
          <p className="air-lede mx-auto mt-5 max-w-[36rem] text-[#a1a1a6]">
            One press copies a complete brief for Cursor, Claude Code or Codex — the stack,
            the install path, every prop, the accessibility rules and the full source. It
            is generated from this page&rsquo;s own metadata, so it never describes a prop
            that doesn&rsquo;t exist.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <AirCopyPrompt prompt={prompt} componentName={component.title} size="lg" />
            <MoreLink href={air("/docs/ai")} tone="dark" className="text-[17px]">
              How the prompt is built
            </MoreLink>
          </div>
        </Reveal>
        <Reveal delay={120} className="mx-auto mt-14 max-w-[52rem]">
          <PromptPeek prompt={prompt} lines={promptLines} />
        </Reveal>
      </section>

      {/* Tech Specs */}
      <section
        id="specs"
        aria-labelledby="specs-title"
        className="scroll-mt-[52px] bg-white px-5 pt-20 pb-20 sm:pt-28 sm:pb-24"
      >
        <div className="mx-auto max-w-[61rem]">
          <Reveal>
            <h2 id="specs-title" className="air-h2 text-[#1d1d1f]">
              Tech Specs
            </h2>
          </Reveal>

          <dl className="mt-10 border-t border-[#d2d2d7]">
            <SpecRow label="Props">
              <PropsList groups={component.props} />
            </SpecRow>

            <SpecRow label="Dependencies">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-[17px] font-semibold">npm packages</p>
                  {component.dependencies.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {component.dependencies.map((dependency) => (
                        <li
                          key={dependency}
                          className="rounded-full bg-[#f5f5f7] px-3 py-1 font-mono text-[13px] text-[#1d1d1f]"
                        >
                          {dependency}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[17px] text-[#6e6e73]">
                      None — only React and Tailwind.
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[17px] font-semibold">Registry items</p>
                  {component.registryDependencies.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {component.registryDependencies.map((dependency) => (
                        <li
                          key={dependency}
                          className="rounded-full bg-[#f5f5f7] px-3 py-1 font-mono text-[13px] text-[#1d1d1f]"
                        >
                          {dependency}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[17px] text-[#6e6e73]">None.</p>
                  )}
                  <p className="mt-3 text-[14px] leading-[1.43] text-[#6e6e73]">
                    The CLI adds any that are missing.
                  </p>
                </div>
              </div>
            </SpecRow>

            <SpecRow label="Accessibility">
              <ul className="flex flex-col gap-3.5">
                {component.accessibility.map((note) => (
                  <li key={note} className="air-body flex gap-3 text-[#1d1d1f]">
                    <Check
                      aria-hidden="true"
                      strokeWidth={2.4}
                      className="mt-[0.3em] size-4 shrink-0 text-[#1a7f37]"
                    />
                    <span>{ticks(note)}</span>
                  </li>
                ))}
              </ul>
            </SpecRow>

            <SpecRow label="Keyboard">
              {component.keyboard.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">Keyboard interactions for {component.title}</caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Key</th>
                      <th scope="col">Behaviour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {component.keyboard.map((entry) => (
                      <tr
                        key={entry.keys.join("+")}
                        className="border-b border-[#e8e8ed] align-top last:border-b-0"
                      >
                        <th scope="row" className="py-3 pr-6 font-normal whitespace-nowrap">
                          <span className="flex gap-1.5">
                            {entry.keys.map((key) => (
                              <kbd
                                key={key}
                                className="inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] bg-white px-2 font-sans text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_#d2d2d7,0_2px_0_#d2d2d7]"
                              >
                                {key}
                              </kbd>
                            ))}
                          </span>
                        </th>
                        <td className="air-body py-3 text-[#1d1d1f]">{ticks(entry.description)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="air-body text-[#1d1d1f]">
                  {component.title} renders no interactive controls of its own, so it adds
                  nothing to the tab order.
                </p>
              )}
            </SpecRow>

            <SpecRow label="Files">
              <ul className="flex flex-col gap-2">
                {sources.map((source) => (
                  <li key={source.path} className="font-mono text-[14px] text-[#1d1d1f]">
                    {source.target}
                  </li>
                ))}
              </ul>
            </SpecRow>

            <SpecRow label="Registry">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[14px] text-[#6e6e73]">Item</dt>
                  <dd className="mt-1 font-mono text-[14px] text-[#1d1d1f]">{registryTarget}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-[#6e6e73]">Since</dt>
                  <dd className="mt-1 text-[17px] text-[#1d1d1f]">{formatDate(component.since)}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-[#6e6e73]">Licence</dt>
                  <dd className="mt-1 text-[17px] text-[#1d1d1f]">MIT</dd>
                </div>
              </dl>
            </SpecRow>
          </dl>
        </div>
      </section>

      {/* Customize */}
      {component.customization.length > 0 ? (
        <section
          id="customize"
          aria-labelledby="customize-title"
          className="scroll-mt-[52px] bg-[#f5f5f7] px-5 pt-20 pb-24 sm:pt-28 sm:pb-32"
        >
          <div className="mx-auto max-w-[61rem]">
            <Reveal>
              <h2 id="customize-title" className="air-h2 text-[#1d1d1f]">
                Make it yours.
              </h2>
              <p className="air-lede mt-4 max-w-[36rem] text-[#6e6e73]">
                It is your file now. A few of the changes people make first.
              </p>
            </Reveal>
            <div className="mt-14 flex flex-col gap-14">
              {component.customization.map((example) => (
                <Reveal key={example.title}>
                  <h3 className="text-[21px] font-semibold tracking-[-0.018em] text-[#1d1d1f]">
                    {example.title}
                  </h3>
                  <p className="air-body mt-2 max-w-[44rem] text-[#6e6e73]">
                    {ticks(example.description)}
                  </p>
                  <AirCode
                    code={example.code}
                    language={example.language ?? "tsx"}
                    tone="white"
                    className="mt-5"
                    collapsible
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Related + previous/next */}
      <section aria-labelledby="related-title" className="bg-white px-5 pt-20 pb-24 sm:pt-28">
        <div className="mx-auto max-w-[75rem]">
          {related.length > 0 ? (
            <>
              <h2 id="related-title" className="air-shelf-title text-[#1d1d1f]">
                Explore more. <span>Components that work well alongside it.</span>
              </h2>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.slug} className="flex">
                    <ProductCard item={toCatalogItem(item)} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <h2 id="related-title" className="sr-only">
              More components
            </h2>
          )}

          <nav
            aria-label="Previous and next component"
            className="mt-20 grid gap-4 border-t border-[#d2d2d7] pt-8 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={air(`/components/${previous.slug}`)}
                className="group flex items-center gap-3 rounded-[18px] p-4 transition-colors hover:bg-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
              >
                <ChevronLeft aria-hidden="true" className="size-5 text-[#0066cc]" />
                <span>
                  <span className="block text-[14px] text-[#6e6e73]">Previous</span>
                  <span className="block text-[21px] font-semibold tracking-[-0.018em] text-[#1d1d1f]">
                    {previous.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={air(`/components/${next.slug}`)}
                className="group flex items-center justify-end gap-3 rounded-[18px] p-4 text-right transition-colors hover:bg-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-[#0071e3]"
              >
                <span>
                  <span className="block text-[14px] text-[#6e6e73]">Next</span>
                  <span className="block text-[21px] font-semibold tracking-[-0.018em] text-[#1d1d1f]">
                    {next.title}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 text-[#0066cc]" />
              </Link>
            ) : null}
          </nav>

          <p className="mt-10 text-center text-[17px]">
            <MoreLink href={air("/components")}>See all components</MoreLink>
          </p>
        </div>
      </section>
    </main>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso))
}

function InstallRow({
  number,
  title,
  note,
  description,
  children,
}: {
  number: number
  title: string
  note?: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="grid gap-5 border-b border-[#d2d2d7] py-9 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10">
      <div>
        <p className="text-[14px] text-[#6e6e73]">
          Step {number}
          {note ? <span className="ml-2 font-semibold text-[#b64400]">{note}</span> : null}
        </p>
        <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.024em] text-[#1d1d1f]">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-[1.47] text-[#6e6e73]">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  )
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-[#d2d2d7] py-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
      <dt className="self-start text-[24px] font-semibold tracking-[-0.024em] text-[#1d1d1f] md:sticky md:top-[76px]">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function PropsList({ groups }: { groups: PropGroup[] }) {
  if (groups.length === 0) {
    return <p className="air-body text-[#6e6e73]">This component takes no props.</p>
  }
  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <div key={group.name}>
          {groups.length > 1 || group.description ? (
            <div className="mb-4">
              <h3 className="font-mono text-[17px] font-semibold text-[#1d1d1f]">{group.name}</h3>
              {group.description ? (
                <p className="mt-1 text-[15px] text-[#6e6e73]">{ticks(group.description)}</p>
              ) : null}
            </div>
          ) : null}
          <ul className="flex flex-col">
            {group.props.map((prop) => (
              <li
                key={prop.name}
                className="border-b border-[#e8e8ed] py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <code className="font-mono text-[15px] font-semibold text-[#1d1d1f]">
                    {prop.name}
                  </code>
                  {prop.required ? (
                    <span className="text-[12px] font-semibold text-[#b64400]">Required</span>
                  ) : null}
                  <code className="font-mono text-[13px] break-all text-[#6e6e73]">{prop.type}</code>
                  {prop.defaultValue ? (
                    <span className="text-[13px] text-[#6e6e73]">
                      Default <code className="font-mono text-[#1d1d1f]">{prop.defaultValue}</code>
                    </span>
                  ) : null}
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.47] text-[#424245]">
                  {ticks(prop.description)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
