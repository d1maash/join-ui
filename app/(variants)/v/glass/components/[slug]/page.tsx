import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Check, ChevronRight } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { GlassCommand } from "@/components/variants/glass/command"
import {
  ComponentWindow,
  InstallMethods,
  SourceFiles,
} from "@/components/variants/glass/component-window"
import { GlassCopy } from "@/components/variants/glass/copy"
import { LocalNav } from "@/components/variants/glass/local-nav"
import { GlassKeyboard, GlassProps } from "@/components/variants/glass/reference"
import { Prose, SiblingNav } from "@/components/variants/glass/sibling"
import { categoryInk, ComponentTile } from "@/components/variants/glass/tile"
import { g, pill, textLink } from "@/components/variants/glass/ui"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated, getSiblings } from "@/lib/registry"
import { toCatalogItem } from "@/lib/registry/catalog"
import { getComponentSources } from "@/lib/registry/source"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

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
  return { title: component.title, description: component.description }
}

const SECTIONS = [
  { id: "preview", label: "Preview" },
  { id: "install", label: "Install" },
  { id: "overview", label: "Overview" },
  { id: "usage", label: "Usage" },
  { id: "props", label: "Props" },
  { id: "accessibility", label: "Accessibility" },
  { id: "customization", label: "Customization" },
]

export default async function GlassComponentPage({ params }: PageProps) {
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
  }

  /* The overview as a statement: its first sentence in ink, the rest quieter. */
  const [lead, ...rest] = component.overview.split(/(?<=\.)\s+/)

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content" className="pt-[76px]">
        <LocalNav
          title={component.title}
          links={SECTIONS}
          spy={SECTIONS.filter((section) => section.id !== "install").map((section) => section.id)}
          prompt={prompt}
        />

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <header className="px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="mx-auto flex max-w-[900px] flex-col items-center">
            <Link
              href={g(`/components?category=${encodeURIComponent(component.category)}`)}
              className={cn(
                "g-type-in rounded-sm text-[19px] font-semibold tracking-[-0.02em] hover:underline sm:text-[21px]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
                categoryInk(component.category)
              )}
            >
              {component.category}
            </Link>
            <h1
              className="g-type-in mt-2 text-[clamp(3rem,8.4vw,6rem)] leading-[1] font-semibold tracking-[-0.05em] text-balance text-[#1d1d1f]"
              style={{ animationDelay: "70ms" }}
            >
              {component.title}
            </h1>
            <p
              className="g-type-in mt-5 max-w-[40rem] text-[19px] leading-[1.42] tracking-[-0.022em] text-pretty text-[#3a3a3e] sm:text-[21px] sm:leading-[1.38]"
              style={{ animationDelay: "160ms" }}
            >
              {component.description}
            </p>

            <div
              className="g-type-in mt-8 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <GlassCopy
                value={prompt}
                kind="prompt"
                idle="Copy prompt"
                toastMessage={`${component.title} prompt copied`}
                tone="primary"
                size="lg"
              />
              <GlassCopy
                value={component.installCommand}
                idle="Copy install command"
                done="Command copied"
                toastMessage="Install command copied"
                size="lg"
              />
            </div>
            <div
              className="g-type-in mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[17px]"
              style={{ animationDelay: "300ms" }}
            >
              <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className={textLink}>
                View source on GitHub
                <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <Link href={`/preview/${component.slug}`} className={textLink}>
                Open full-screen preview
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.25} />
              </Link>
            </div>
          </div>
        </header>

        {/* ── The window ───────────────────────────────────────────── */}
        <section aria-label={`${component.title}, live`} className="px-3 pt-14 sm:px-5 sm:pt-16">
          <div
            className="g-settle mx-auto max-w-[1180px]"
            style={{ animationDelay: "320ms" }}
          >
            <ComponentWindow
              slug={component.slug}
              title={component.title}
              code={
                <SourceFiles
                  label={`${component.title} source files`}
                  files={sources.map((source) => ({
                    name: source.name,
                    node: (
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
              }
              install={
                <InstallMethods
                  cli={
                    <Method
                      title={`With the ${siteConfig.namespace} registry`}
                      description={
                        <>
                          Once the namespace is in your <Mono>components.json</Mono>, one
                          command resolves the dependencies and writes{" "}
                          <Mono>{primary.target}</Mono>.{" "}
                          <Link href={g("/docs/registry-setup")} className={textLink}>
                            Set up the registry
                            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                          </Link>
                        </>
                      }
                    >
                      <GlassCommand id="g-cmd-cli" commands={shadcnCommands(registryTarget)} />
                    </Method>
                  }
                  url={
                    <Method
                      title="Straight from the URL"
                      description="No namespace to configure: the registry item is a plain JSON file, and the CLI can take its address directly."
                    >
                      <GlassCommand id="g-cmd-url" commands={shadcnCommands(registryUrl)} />
                    </Method>
                  }
                  manual={
                    <Method
                      title="By hand"
                      description={
                        component.dependencies.length > 0 ? (
                          <>
                            Install the dependencies, then copy the source into{" "}
                            <Mono>{primary.target}</Mono>.
                          </>
                        ) : (
                          <>
                            Nothing to install — copy the source into{" "}
                            <Mono>{primary.target}</Mono> and you are done.
                          </>
                        )
                      }
                    >
                      {component.dependencies.length > 0 ? (
                        <GlassCommand
                          id="g-cmd-deps"
                          commands={dependencyCommands(component.dependencies)}
                        />
                      ) : null}
                      <CodeBlock
                        code={primary.content}
                        language={primary.language}
                        title={primary.target}
                        collapsible
                        collapsedHeight={300}
                      />
                    </Method>
                  }
                />
              }
              prompt={
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <h3 className="text-[21px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                        A brief for your coding agent.
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-[1.47] tracking-[-0.012em] text-[#3a3a3e]">
                        For Claude Code, Cursor, Codex or any other agent. Built from this
                        component&apos;s metadata and its real source, so it never
                        describes a prop that does not exist.
                      </p>
                    </div>
                    <GlassCopy
                      value={prompt}
                      kind="prompt"
                      idle="Copy prompt"
                      toastMessage={`${component.title} prompt copied`}
                      tone="primary"
                    />
                  </div>
                  <CodeBlock
                    code={prompt}
                    language="text"
                    title={`${component.slug}.prompt.txt`}
                    collapsible
                    collapsedHeight={420}
                  />
                </div>
              }
            />
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          {/* ── Overview ───────────────────────────────────────────── */}
          <section
            id="overview"
            aria-label="Overview"
            className="g-rise mx-auto max-w-[920px] scroll-mt-36 pt-28 sm:pt-36"
          >
            <h2 className="sr-only">Overview</h2>
            <p className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.16] font-semibold tracking-[-0.036em] text-balance text-[#1d1d1f]">
              {lead}
            </p>
            {rest.length > 0 ? (
              <p className="mt-8 max-w-[44rem] text-[17px] leading-[1.6] tracking-[-0.016em] text-pretty text-[#3a3a3e] sm:text-[19px] sm:leading-[1.55]">
                {rest.join(" ")}
              </p>
            ) : null}
          </section>

          {/* ── Usage ──────────────────────────────────────────────── */}
          <Section id="usage" title="Usage." lead="The smallest thing that works. Paste it, then make it yours.">
            <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
          </Section>

          {/* ── Props ──────────────────────────────────────────────── */}
          <Section id="props" title="Props." lead="Every prop the component accepts, typed and documented from the same record as the registry.">
            <GlassProps groups={component.props} />
          </Section>

          {/* ── Accessibility & keyboard ───────────────────────────── */}
          <Section id="accessibility" title="Accessible by default." lead="WCAG 2.2 AA is the floor. Here is what that means for this component.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Accessibility">
                <ul className="flex flex-col gap-3.5">
                  {component.accessibility.map((note) => (
                    <li key={note} className="flex gap-3 text-[15px] leading-[1.5] tracking-[-0.012em] text-[#3a3a3e]">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white"
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span>
                        <Prose text={note} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Keyboard">
                <GlassKeyboard entries={component.keyboard} title={component.title} />
              </Panel>
            </div>

            <div id="dependencies" className="mt-5 grid scroll-mt-36 gap-5 sm:grid-cols-2">
              <Panel title="npm packages">
                <Chips
                  items={component.dependencies}
                  empty="None — it needs only React and Tailwind."
                />
              </Panel>
              <Panel title="Registry items">
                <Chips items={component.registryDependencies} empty="None." />
                {component.registryDependencies.length > 0 ? (
                  <p className="mt-3 text-[13px] text-[#56565b]">
                    Installed by the CLI when they are missing.
                  </p>
                ) : null}
              </Panel>
            </div>
          </Section>

          {/* ── Customization ──────────────────────────────────────── */}
          {component.customization.length > 0 ? (
            <Section id="customization" title="Make it yours." lead="It is your code now. A few places people usually start.">
              <div className="flex flex-col gap-5">
                {component.customization.map((example) => (
                  <article
                    key={example.title}
                    className="g-rise g-glass g-flat rounded-[34px] p-2.5 [--g-fill:0.62]"
                  >
                    <div className="px-4 pt-4 pb-4 sm:px-6 sm:pt-5">
                      <h3 className="text-[21px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                        {example.title}
                      </h3>
                      <p className="mt-1.5 max-w-[46rem] text-[15px] leading-[1.47] tracking-[-0.012em] text-[#3a3a3e]">
                        <Prose text={example.description} />
                      </p>
                    </div>
                    <CodeBlock code={example.code} language={example.language ?? "tsx"} />
                  </article>
                ))}
              </div>
            </Section>
          ) : null}

          {/* ── Related ────────────────────────────────────────────── */}
          {related.length > 0 ? (
            <Section id="related" title="Pairs well with.">
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.slug} className="g-rise">
                    <ComponentTile item={toCatalogItem(item)} />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* ── Previous / next ────────────────────────────────────── */}
          <SiblingNav
            label="Component navigation"
            className="mt-20"
            previous={
              previous
                ? { title: previous.title, href: g(`/components/${previous.slug}`) }
                : undefined
            }
            next={next ? { title: next.title, href: g(`/components/${next.slug}`) } : undefined}
          />

          <p className="mt-10 text-center">
            <Link href={g("/components")} className={pill("glass", "md")}>
              All components
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-black/[0.05] px-1.5 py-0.5 font-mono text-[0.86em] text-[#1d1d1f]">
      {children}
    </code>
  )
}

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
    <section aria-labelledby={`${id}-title`} id={id} className="scroll-mt-36 pt-28 sm:pt-36">
      <div className="g-rise mb-10 max-w-[46rem]">
        <h2
          id={`${id}-title`}
          className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.042em] text-[#1d1d1f]"
        >
          {title}
        </h2>
        {lead ? (
          <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.016em] text-[#3a3a3e] sm:text-[19px] sm:leading-[1.42]">
            {lead}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="g-rise g-glass g-flat rounded-[30px] p-6 [--g-fill:0.66] sm:p-7">
      <h3 className="mb-5 text-[19px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-[15px] text-[#56565b]">{empty}</p>
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-white px-3.5 py-1.5 font-mono text-[13px] text-[#1d1d1f] shadow-[0_0_0_0.5px_rgb(24_32_72/0.12),0_1px_2px_rgb(24_32_72/0.06)]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

function Method({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-2xl">
        <h3 className="text-[21px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-[1.5] tracking-[-0.012em] text-[#3a3a3e]">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

