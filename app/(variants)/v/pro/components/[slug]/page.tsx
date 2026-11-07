import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"

import { accentFor } from "@/components/variants/pro/chapters-data"
import { ProCode } from "@/components/variants/pro/code"
import { CommandBox } from "@/components/variants/pro/command"
import {
  CopyPill,
  CopyPromptPill,
  PromptProvider,
} from "@/components/variants/pro/copy"
import { proHref } from "@/components/variants/pro/href"
import { LocalNav } from "@/components/variants/pro/local-nav"
import { ProPreview } from "@/components/variants/pro/preview"
import { Reveal } from "@/components/variants/pro/reveal"
import { SegmentedTabs } from "@/components/variants/pro/segmented"
import {
  InlineCode,
  KeyboardSheet,
  PagerLink,
  ProSection,
  PropsSheet,
  RichText,
  SpecRow,
} from "@/components/variants/pro/sheet"
import { textLinkClass, type } from "@/components/variants/pro/styles"
import { ComponentTile } from "@/components/variants/pro/tile"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import {
  allComponents,
  getComponent,
  getRelated,
  getSiblings,
  getTraits,
} from "@/lib/registry"
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
  { id: "overview", label: "Overview" },
  { id: "code", label: "Code" },
  { id: "install", label: "Install" },
  { id: "props", label: "Props" },
  { id: "accessibility", label: "Accessibility" },
  { id: "customize", label: "Customize" },
]

const TRAIT_LABEL: Record<string, string> = {
  animated: "Animated",
  accessible: "Accessible",
  "zero-deps": "No dependencies",
}

/** The first sentence leads in white, the next follows in grey — apple.com's copy block. */
function splitOverview(overview: string) {
  const sentences = overview.split(/(?<=[.!?])\s+(?=[A-Z“"])/)
  return {
    lead: sentences[0] ?? overview,
    follow: sentences.slice(1, 2).join(" "),
    rest: sentences.slice(2).join(" "),
  }
}

/*
 * A component page, as an apple.com product page: the sub-nav, the name and
 * one line, the live object on a large stage, then the specs. The original
 * ran the installation twice (a tab above the fold and a section below it);
 * here it is said once, with the CLI, the URL and the manual route side by
 * side, and the prompt has a section of its own instead of a tab.
 */
export default async function ProComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component)
  const { previous, next } = getSiblings(component.slug)
  const traits = getTraits(component)
  const accent = accentFor(component.slug)

  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`
  const { lead, follow, rest } = splitOverview(component.overview)

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
    <PromptProvider prompt={prompt} name={component.title}>
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LocalNav title={component.title} links={SECTIONS} />

      <main id="main-content" className="overflow-x-clip">
        {/* -------------------------------------------------------------- */}
        {/* Hero                                                            */}
        {/* -------------------------------------------------------------- */}
        <header
          id="top"
          className="relative scroll-mt-20 px-6 pt-16 text-center sm:pt-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
            style={{
              background: `radial-gradient(55% 60% at 50% 0%, color-mix(in oklab, ${accent} 16%, transparent) 0%, transparent 70%)`,
            }}
          />
          <div className="relative mx-auto max-w-[60rem]">
            <p className={type.eyebrow}>
              {component.status === "new" ? (
                <span className="mr-2 text-[#ff9f0a]">New</span>
              ) : null}
              <Link
                href={proHref(
                  `/components?category=${encodeURIComponent(component.category)}`
                )}
                className="rounded-sm text-[#86868b] hover:text-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]"
              >
                {component.category}
              </Link>
            </p>
            <h1 className="mt-3 text-[clamp(3rem,7.2vw,6rem)] leading-[1] font-semibold tracking-[-0.045em] text-balance text-[#f5f5f7]">
              {component.title}
            </h1>
            <p className={cn(type.intro, "mx-auto mt-6 max-w-[42rem] text-[#86868b]")}>
              {component.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <CopyPromptPill />
              <CopyPill
                value={component.installCommand}
                label="Copy install command"
                copiedLabel="Command copied"
                toastMessage="Install command copied"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(textLinkClass, "text-[17px]")}
              >
                View source
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only">on GitHub (opens in a new tab)</span>
              </a>
              <Link
                href={`/preview/${component.slug}`}
                className={cn(textLinkClass, "text-[17px]")}
              >
                Open full preview
                <span aria-hidden="true" className="ml-0.5">
                  ›
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* -------------------------------------------------------------- */}
        {/* Overview — the live stage                                       */}
        {/* -------------------------------------------------------------- */}
        <section
          id="overview"
          aria-labelledby="overview-title"
          className="scroll-mt-[60px] px-3 pt-16 sm:px-6 sm:pt-20"
        >
          <h2 id="overview-title" className="sr-only">
            Overview
          </h2>
          <div
            className="pro-stage relative mx-auto flex min-h-[560px] max-w-[1320px] items-center justify-center overflow-hidden rounded-[28px] px-4 py-14 sm:rounded-[40px] sm:px-10 sm:py-20 lg:px-16"
            style={{ "--pro-stage-tint": accent } as React.CSSProperties}
          >
            <div className="relative flex w-full justify-center">
              <ProPreview slug={component.slug} />
            </div>
          </div>

          <div className="mx-auto max-w-[1080px] px-3 pt-20 pb-24 sm:px-0 sm:pt-28 sm:pb-32">
            <Reveal>
              <p className={cn(type.intro, "max-w-[52rem] text-[#86868b]")}>
                <span className="text-[#f5f5f7]">{lead}</span> {follow}
              </p>
            </Reveal>
            {rest ? (
              <Reveal delay={100}>
                <p className="mt-10 max-w-none text-[16px] leading-[1.6] tracking-[-0.016em] text-[#a1a1a6] lg:columns-2 lg:gap-14">
                  {rest}
                </p>
              </Reveal>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-[1080px] px-6">
          {/* ------------------------------------------------------------ */}
          {/* Code                                                          */}
          {/* ------------------------------------------------------------ */}
          <ProSection
            id="code"
            title="The source."
            lead={
              <>
                Exactly what the CLI writes to{" "}
                <span className="text-[#f5f5f7]">{primary.target}</span>. Every line is
                yours to change.
              </>
            }
          >
            {sources.length > 1 ? (
              <SegmentedTabs
                label={`${component.title} source files`}
                panelClassName="mt-5"
                items={sources.map((source) => ({
                  value: source.name,
                  label: source.name,
                  content: (
                    <ProCode
                      code={source.content}
                      language={source.language}
                      title={source.target}
                      collapsible
                      showLineNumbers
                    />
                  ),
                }))}
              />
            ) : (
              <ProCode
                code={primary.content}
                language={primary.language}
                title={primary.target}
                collapsible
                showLineNumbers
              />
            )}
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Install + usage                                               */}
          {/* ------------------------------------------------------------ */}
          <ProSection
            id="install"
            title="Install it your way."
            lead="With the CLI by name, straight from the registry URL, or by hand."
          >
            <SegmentedTabs
              label="Installation method"
              panelClassName="mt-6"
              items={[
                {
                  value: "cli",
                  label: "CLI",
                  content: (
                    <div className="flex flex-col gap-4">
                      <CommandBox
                        commands={shadcnCommands(registryTarget)}
                        label="Install with the shadcn CLI"
                      />
                      <p className="text-[15px] leading-[1.5] text-[#86868b]">
                        Needs the {siteConfig.namespace} namespace in your{" "}
                        <InlineCode>components.json</InlineCode>.{" "}
                        <Link
                          href={proHref("/docs/registry-setup")}
                          className={textLinkClass}
                        >
                          Registry setup ›
                        </Link>
                      </p>
                    </div>
                  ),
                },
                {
                  value: "url",
                  label: "URL",
                  content: (
                    <div className="flex flex-col gap-4">
                      <CommandBox
                        commands={shadcnCommands(registryUrl)}
                        label="Install from a URL"
                      />
                      <p className="text-[15px] leading-[1.5] text-[#86868b]">
                        No namespace to configure. The registry item is a plain JSON
                        file, and the CLI resolves its dependencies on its own.
                      </p>
                    </div>
                  ),
                },
                {
                  value: "manual",
                  label: "Manual",
                  content: (
                    <div className="flex flex-col gap-5">
                      <p className="text-[15px] leading-[1.5] text-[#86868b]">
                        {component.dependencies.length > 0 ? (
                          <>
                            Install the dependencies, then copy the source into{" "}
                            <InlineCode>{primary.target}</InlineCode>.
                          </>
                        ) : (
                          <>
                            Nothing to install. Copy the source into{" "}
                            <InlineCode>{primary.target}</InlineCode> and you are done.
                          </>
                        )}
                      </p>
                      {component.dependencies.length > 0 ? (
                        <CommandBox
                          commands={dependencyCommands(component.dependencies)}
                          label="Install dependencies"
                        />
                      ) : null}
                      <ProCode
                        code={primary.content}
                        language={primary.language}
                        title={primary.target}
                        collapsible
                        collapsedHeight={280}
                      />
                    </div>
                  ),
                },
              ]}
            />

            <div className="mt-16">
              <h3 className={cn(type.title, "text-[#f5f5f7]")}>Then use it.</h3>
              <ProCode
                code={component.usage}
                language="tsx"
                title="example.tsx"
                className="mt-6"
              />
            </div>
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Props                                                         */}
          {/* ------------------------------------------------------------ */}
          <ProSection
            id="props"
            title="Props."
            lead="Every prop the component takes, typed and defaulted."
          >
            <PropsSheet groups={component.props} />
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Tech specs                                                    */}
          {/* ------------------------------------------------------------ */}
          <ProSection id="specs" title="Tech specs.">
            <dl>
              <SpecRow label="Category">{component.category}</SpecRow>
              <SpecRow label="Status">
                <span className="capitalize">{component.status}</span>
              </SpecRow>
              <SpecRow label="Added">
                <time dateTime={component.since}>{formatDate(component.since)}</time>
                {component.updated ? (
                  <>
                    {" · Updated "}
                    <time dateTime={component.updated}>
                      {formatDate(component.updated)}
                    </time>
                  </>
                ) : null}
              </SpecRow>
              <SpecRow label="Installs to">
                <span className="font-mono text-[15px] text-[#f5f5f7]">
                  {primary.target}
                </span>
              </SpecRow>
              <SpecRow label="npm dependencies">
                {component.dependencies.length > 0 ? (
                  <span className="font-mono text-[15px] text-[#f5f5f7]">
                    {component.dependencies.join(", ")}
                  </span>
                ) : (
                  "None — React and Tailwind are all it needs."
                )}
              </SpecRow>
              <SpecRow label="Registry dependencies">
                {component.registryDependencies.length > 0 ? (
                  <>
                    <span className="font-mono text-[15px] text-[#f5f5f7]">
                      {component.registryDependencies.join(", ")}
                    </span>
                    <span className="mt-1 block text-[15px]">
                      Installed automatically by the CLI when they are missing.
                    </span>
                  </>
                ) : (
                  "None."
                )}
              </SpecRow>
              <SpecRow label="Traits">
                {traits.length > 0
                  ? traits.map((trait) => TRAIT_LABEL[trait] ?? trait).join(" · ")
                  : "—"}
              </SpecRow>
              <SpecRow label="Licence">MIT</SpecRow>
            </dl>
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Accessibility + keyboard                                      */}
          {/* ------------------------------------------------------------ */}
          <ProSection
            id="accessibility"
            title="Accessible by design."
            lead="WCAG 2.2 AA is the floor, not a later pass."
          >
            <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              {component.accessibility.map((note) => (
                <li key={note} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-[3px] flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#30d158]/15 text-[#30d158]"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-[17px] leading-[1.5] tracking-[-0.022em] text-[#a1a1a6]">
                    <RichText>{note}</RichText>
                  </p>
                </li>
              ))}
            </ul>

            <h3 className={cn(type.title, "mt-20 text-[#f5f5f7]")}>Keyboard.</h3>
            <div className="mt-6">
              <KeyboardSheet entries={component.keyboard} title={component.title} />
            </div>
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Customization                                                 */}
          {/* ------------------------------------------------------------ */}
          {component.customization.length > 0 ? (
            <ProSection
              id="customize"
              title="Make it yours."
              lead="A few of the ways the source bends to your product."
            >
              <div className="flex flex-col gap-16">
                {component.customization.map((example) => (
                  <div
                    key={example.title}
                    className="grid gap-6 lg:grid-cols-12 lg:gap-10"
                  >
                    <div className="lg:col-span-4">
                      <h3 className="text-[21px] leading-[1.2] font-semibold tracking-[-0.025em] text-[#f5f5f7]">
                        {example.title}
                      </h3>
                      <p className="mt-3 text-[16px] leading-[1.55] tracking-[-0.016em] text-[#86868b]">
                        <RichText>{example.description}</RichText>
                      </p>
                    </div>
                    <div className="min-w-0 lg:col-span-8">
                      <ProCode
                        code={example.code}
                        language={example.language ?? "tsx"}
                        bare
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ProSection>
          ) : null}

          {/* ------------------------------------------------------------ */}
          {/* Prompt                                                        */}
          {/* ------------------------------------------------------------ */}
          <ProSection
            id="prompt"
            title="Hand it to your agent."
            lead={
              <>
                A complete brief for Cursor, Claude Code or Codex, built from this
                component’s metadata and its real source.{" "}
                <span className="text-[#f5f5f7]">
                  It cannot describe a prop that does not exist.
                </span>
              </>
            }
          >
            <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <CopyPromptPill />
              <Link
                href={proHref("/docs/ai")}
                className={cn(textLinkClass, "text-[17px]")}
              >
                How the prompt is built
                <span aria-hidden="true" className="ml-0.5">
                  ›
                </span>
              </Link>
            </div>
            <ProCode
              code={prompt}
              language="text"
              title={`${component.slug}.prompt.txt`}
              collapsible
              collapsedHeight={360}
            />
          </ProSection>

          {/* ------------------------------------------------------------ */}
          {/* Related                                                       */}
          {/* ------------------------------------------------------------ */}
          {related.length > 0 ? (
            <ProSection id="related" title="Explore more.">
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.slug} className="flex">
                    <ComponentTile
                      item={toCatalogItem(item)}
                      accent={accentFor(item.slug)}
                      headingLevel={3}
                      className="w-full"
                    />
                  </li>
                ))}
              </ul>
            </ProSection>
          ) : null}

          <nav
            aria-label="Component navigation"
            className="grid gap-4 border-t border-white/[0.12] pt-10 pb-32 sm:grid-cols-2"
          >
            {previous ? (
              <PagerLink
                href={proHref(`/components/${previous.slug}`)}
                direction="Previous"
                title={previous.title}
              />
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <PagerLink
                href={proHref(`/components/${next.slug}`)}
                direction="Next"
                title={next.title}
                end
              />
            ) : null}
          </nav>
        </div>
      </main>
    </PromptProvider>
  )
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
