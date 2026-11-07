import type * as React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { CopyButton } from "@/components/site/copy-button"
import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { PackageManagerTabs } from "@/components/site/package-manager-tabs"
import { Bench, Thumb } from "@/components/variants/specimen/live"
import { CropMarks } from "@/components/variants/specimen/marks"
import { PURPOSE, href, plateNo } from "@/components/variants/specimen/plates"
import { SpecimenPlate } from "@/components/variants/specimen/scenes"
import { Keycap, Prose, SheetSection } from "@/components/variants/specimen/type"
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

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return { title: "Plate not found" }
  return {
    title: `PL. ${plateNo(slug)} ${component.title}`,
    description: component.description,
    robots: { index: false, follow: false },
  }
}

const STATUS: Record<string, string> = {
  new: "New",
  stable: "Stable",
  updated: "Updated",
  experimental: "Experimental",
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

export default async function PlatePage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const no = plateNo(component.slug)
  const total = String(componentsByName.length).padStart(2, "0")
  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component)
  const { previous, next } = getSiblings(component.slug)

  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`
  const propCount = component.props.reduce((sum, group) => sum + group.props.length, 0)

  const index = [
    { id: "anatomy", n: "0", title: "Anatomy" },
    { id: "bench", n: "1", title: "On the bench" },
    { id: "specification", n: "2", title: "Specification" },
    { id: "keyboard", n: "3", title: "Keyboard" },
    { id: "accessibility", n: "4", title: "Accessibility" },
    { id: "procedure", n: "5", title: "Procedure" },
    { id: "dependencies", n: "6", title: "Dependencies" },
    { id: "customization", n: "7", title: "Customization" },
    { id: "usage", n: "A", title: "Usage" },
    { id: "source", n: "B", title: "Source" },
    { id: "prompt", n: "C", title: "Agent brief" },
  ]

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
    <main id="main-content" className="pb-6">
      <script
        type="application/ld+json"
        // Serialised from build-time constants, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── The plate head ─────────────────────────────────────────────── */}
      <header data-running="Plate" className="sp-wrap pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb" className="sp-label flex flex-wrap items-center gap-x-2">
          <Link href={href("/")} className="hover:text-[var(--sp-ink)]">
            Join UI
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={href("/components")} className="hover:text-[var(--sp-ink)]">
            Plates
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={href(`/components?category=${encodeURIComponent(component.category)}`)}
            className="hover:text-[var(--sp-ink)]"
          >
            {component.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[var(--sp-ink)]">
            PL. {no}
          </span>
        </nav>

        <div className="sp-grid mt-10 items-end gap-y-6 lg:mt-14">
          <p
            aria-hidden="true"
            className="sp-display col-span-4 text-[clamp(96px,15vw,216px)] leading-[0.74] tracking-[-0.045em] text-[var(--sp-ink)] lg:col-span-3"
          >
            {no}
          </p>
          <div className="col-span-4 lg:col-span-9">
            <p className="sp-label">Plate {no} of {total}</p>
            <h1 className="sp-display mt-3 text-[clamp(52px,8.2vw,124px)] leading-[0.9]">
              {component.title}
            </h1>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 border-y border-[var(--sp-ink)] sm:grid-cols-4 lg:grid-cols-6">
          <Spec term="Category" value={component.category} />
          <Spec term="Status" value={STATUS[component.status] ?? component.status} />
          <Spec term="Entered" value={formatDate(component.since)} />
          <Spec term="Revised" value={component.updated ? formatDate(component.updated) : "—"} />
          <Spec term="Props" value={String(propCount)} />
          <Spec
            term="Packages"
            value={component.dependencies.length ? component.dependencies.join(", ") : "none"}
          />
        </dl>

        <div className="sp-grid mt-8 gap-y-8">
          <p className="col-span-4 text-[clamp(20px,1.9vw,24px)] leading-[1.35] tracking-[-0.012em] text-pretty lg:col-span-7">
            {component.description}
          </p>
          <div className="sp-btns col-span-4 flex flex-wrap content-start items-center gap-2 lg:col-span-4 lg:col-start-9 lg:justify-end">
            <CopyPromptButton prompt={prompt} componentName={component.title} variant="primary" />
            <CopyButton
              value={component.installCommand}
              label="Copy install command"
              copiedLabel="Command copied"
              toastMessage="Install command copied"
              variant="secondary"
              size="sm"
              showLabel
            />
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-8 items-center gap-1 px-2 text-[13px] font-medium underline decoration-[var(--sp-rule-strong)] underline-offset-4 hover:decoration-[var(--sp-ink)]"
            >
              Source <ArrowUpRight aria-hidden="true" className="size-3.5" />
              <span className="sr-only">on GitHub (opens in a new tab)</span>
            </a>
            <Link
              href={`/preview/${component.slug}`}
              className="inline-flex h-8 items-center gap-1 px-2 text-[13px] font-medium underline decoration-[var(--sp-rule-strong)] underline-offset-4 hover:decoration-[var(--sp-ink)]"
            >
              Full-screen preview
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Fig. 1: the anatomy ─────────────────────────────────────────── */}
      <section
        id="anatomy"
        aria-labelledby="anatomy-title"
        data-running="Anatomy"
        className="sp-wrap mt-16 scroll-mt-20 lg:mt-24"
      >
        <h2 id="anatomy-title" className="sr-only">
          Anatomy
        </h2>
        <SpecimenPlate
          slug={component.slug}
          fig={`FIG. ${no}.1`}
          note="Live · scale 1:1"
          stageClassName="min-h-[min(640px,80vh)]"
          caption={
            <>
              {component.title}, lettered. The drawing is the component itself, running —
              hover a letter to find its part.
            </>
          }
        />
      </section>

      {/* ─── Overview, set as a reading column with a side note ─────────── */}
      <section aria-label="Overview" className="sp-wrap mt-24 lg:mt-32">
        <div className="sp-grid gap-y-6">
          <p className="sp-label col-span-4 lg:col-span-2">Overview</p>
          <p className="col-span-4 max-w-[62ch] text-[18px] leading-[1.65] text-pretty lg:col-span-6">
            {component.overview}
          </p>
          <aside className="col-span-4 lg:col-span-3 lg:col-start-10">
            <p className="sp-serif border-l border-[var(--sp-signal)] pl-4 text-[21px] leading-[1.3] text-[var(--sp-ink-2)]">
              {PURPOSE[component.slug]}
            </p>
          </aside>
        </div>
      </section>

      {/* ─── The datasheet ───────────────────────────────────────────────── */}
      <div className="sp-wrap mt-24 lg:mt-32">
        <div className="sp-grid">
          <aside className="hidden lg:col-span-2 lg:block">
            <nav aria-label="On this plate" className="sticky top-[calc(var(--sp-head)+32px)]">
              <p className="sp-label">On this plate</p>
              <ol className="mt-4 flex flex-col">
                {index.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="group flex items-baseline gap-3 py-1 text-[14px] text-[var(--sp-ink-2)] hover:text-[var(--sp-ink)]"
                    >
                      <span className="sp-mono w-4 text-[11px]">{entry.n}</span>
                      <span className="underline-offset-4 group-hover:underline">
                        {entry.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="col-span-4 flex min-w-0 flex-col gap-24 lg:col-span-10 lg:gap-32">
            {/* § 1 — the bench */}
            <SheetSection
              id="bench"
              n="1"
              title="On the bench"
              aside={`Fig. ${no}.2`}
            >
              <p className="max-w-[60ch] text-[17px] leading-[1.6] text-[var(--sp-ink-2)]">
                Every variant the plate ships with, set out on one sheet — the live
                request, the quiet one, and the stills it leaves behind. These are the
                same demos the full-screen preview runs.
              </p>
              <div className="sp-sheet relative mt-8 flex justify-center px-4 py-12 sm:px-10 lg:px-14 lg:py-16">
                <CropMarks />
                <Bench slug={component.slug} />
              </div>
            </SheetSection>

            {/* § 2 — specification */}
            <SheetSection
              id="specification"
              n="2"
              title="Specification"
              aside={`${propCount} props`}
            >
              <div className="flex flex-col gap-14">
                {component.props.map((group) => (
                  <div key={group.name}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="sp-mono text-[15px] font-semibold">
                        &lt;{group.name}&gt;
                      </h3>
                      {group.description ? (
                        <p className="text-[14px] text-[var(--sp-ink-2)]">{group.description}</p>
                      ) : null}
                    </div>
                    <table className="mt-4 w-full border-collapse text-left">
                      <caption className="sr-only">Props of {group.name}</caption>
                      <thead className="hidden md:table-header-group">
                        <tr className="border-b border-[var(--sp-ink)]">
                          <th scope="col" className="sp-label w-[22%] py-2 pr-4 font-medium">
                            Prop
                          </th>
                          <th scope="col" className="sp-label w-[26%] py-2 pr-4 font-medium">
                            Type
                          </th>
                          <th scope="col" className="sp-label w-[14%] py-2 pr-4 font-medium">
                            Default
                          </th>
                          <th scope="col" className="sp-label py-2 font-medium">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.props.map((prop) => (
                          <tr
                            key={prop.name}
                            className="grid grid-cols-[auto_1fr] gap-x-3 border-b border-[var(--sp-rule)] py-3 align-top md:table-row md:py-0"
                          >
                            <th
                              scope="row"
                              className="sp-mono py-0 pr-4 text-[13px] font-semibold text-[var(--sp-ink)] md:py-3"
                            >
                              {prop.name}
                              {prop.required ? (
                                <span className="sp-label ml-2 !text-[10px]">req.</span>
                              ) : null}
                            </th>
                            <td className="sp-mono col-span-2 py-0 pr-4 text-[12.5px] leading-[1.5] break-words text-[var(--sp-ink-2)] md:col-span-1 md:py-3">
                              {prop.type}
                            </td>
                            <td className="sp-mono col-span-2 py-0 pr-4 text-[12.5px] text-[var(--sp-ink)] md:col-span-1 md:py-3">
                              {prop.defaultValue ?? <span className="text-[var(--sp-ink-3)]">—</span>}
                            </td>
                            <td className="col-span-2 py-1 text-[15px] leading-[1.5] text-[var(--sp-ink-2)] md:py-3">
                              <Prose text={prop.description} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </SheetSection>

            {/* § 3 — keyboard */}
            <SheetSection
              id="keyboard"
              n="3"
              title="Keyboard"
              aside={`${component.keyboard.length} bindings`}
            >
              {component.keyboard.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">Keyboard interactions for {component.title}</caption>
                  <tbody>
                    {component.keyboard.map((entry) => (
                      <tr
                        key={entry.keys.join("-")}
                        className="flex flex-col gap-3 border-b border-[var(--sp-rule)] py-5 first:border-t first:border-t-[var(--sp-ink)] md:table-row"
                      >
                        <th
                          scope="row"
                          className="py-0 pr-8 align-top font-normal md:w-[34%] md:py-5"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            {entry.keys.map((key, keyIndex) => (
                              <span key={key} className="flex items-center gap-2">
                                {keyIndex > 0 ? (
                                  <span className="sp-label" aria-hidden="true">
                                    or
                                  </span>
                                ) : null}
                                <Keycap>{key}</Keycap>
                              </span>
                            ))}
                          </span>
                        </th>
                        <td className="py-0 align-top text-[16px] leading-[1.55] text-[var(--sp-ink-2)] md:py-5 md:pt-6">
                          <Prose text={entry.description} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="max-w-[60ch] border-t border-[var(--sp-ink)] pt-5 text-[17px] leading-[1.6] text-[var(--sp-ink-2)]">
                  {component.title} renders no controls of its own, so it adds nothing to the
                  tab order and listens for no keys.
                </p>
              )}
            </SheetSection>

            {/* § 4 — accessibility */}
            <SheetSection
              id="accessibility"
              n="4"
              title="Accessibility"
              aside="WCAG 2.2 AA"
            >
              <ol className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                {component.accessibility.map((note, noteIndex) => (
                  <li
                    key={note}
                    className="grid grid-cols-[2.25rem_1fr] border-t border-[var(--sp-rule)] pt-4 text-[15px] leading-[1.6] text-[var(--sp-ink-2)]"
                  >
                    <span className="sp-mono text-[12px] text-[var(--sp-ink)]">
                      {String(noteIndex + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <Prose text={note} />
                    </span>
                  </li>
                ))}
              </ol>
            </SheetSection>

            {/* § 5 — procedure */}
            <SheetSection id="procedure" n="5" title="Procedure" aside="Installation">
              <ol className="flex flex-col">
                <Step
                  n="5.1"
                  title="With the CLI"
                  body={
                    <>
                      Needs the {siteConfig.namespace} namespace in{" "}
                      <code className="sp-mono text-[0.85em]">components.json</code> once —
                      see{" "}
                      <Link
                        href={href("/docs/registry-setup")}
                        className="underline underline-offset-4"
                      >
                        registry setup
                      </Link>
                      . The file lands at{" "}
                      <code className="sp-mono text-[0.85em]">{primary.target}</code>.
                    </>
                  }
                >
                  <PackageManagerTabs
                    commands={shadcnCommands(registryTarget)}
                    label="Install with the shadcn CLI"
                  />
                </Step>
                <Step
                  n="5.2"
                  title="From the URL"
                  body="No namespace to configure: the registry item is a plain JSON file, and the CLI can read it straight from its address."
                >
                  <PackageManagerTabs
                    commands={shadcnCommands(registryUrl)}
                    label="Install from a URL"
                  />
                </Step>
                <Step
                  n="5.3"
                  title="By hand"
                  body={
                    component.dependencies.length > 0 ? (
                      <>
                        Add the packages, then copy the source into{" "}
                        <code className="sp-mono text-[0.85em]">{primary.target}</code>.
                      </>
                    ) : (
                      <>
                        Nothing to add. Copy the source into{" "}
                        <code className="sp-mono text-[0.85em]">{primary.target}</code>.
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
                    collapsedHeight={240}
                  />
                </Step>
              </ol>
            </SheetSection>

            {/* § 6 — dependencies */}
            <SheetSection id="dependencies" n="6" title="Dependencies">
              <dl className="grid border-t border-[var(--sp-ink)] md:grid-cols-2">
                <div className="border-b border-[var(--sp-rule)] py-5 md:border-r md:pr-8">
                  <dt className="sp-label">npm packages</dt>
                  <dd className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {component.dependencies.length > 0 ? (
                      component.dependencies.map((dependency) => (
                        <span key={dependency} className="sp-mono text-[15px] text-[var(--sp-ink)]">
                          {dependency}
                        </span>
                      ))
                    ) : (
                      <span className="text-[15px] text-[var(--sp-ink-2)]">
                        None — React and Tailwind only.
                      </span>
                    )}
                  </dd>
                </div>
                <div className="border-b border-[var(--sp-rule)] py-5 md:pl-8">
                  <dt className="sp-label">Registry items</dt>
                  <dd className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {component.registryDependencies.length > 0 ? (
                      component.registryDependencies.map((dependency) => (
                        <span key={dependency} className="sp-mono text-[15px] text-[var(--sp-ink)]">
                          {dependency}
                        </span>
                      ))
                    ) : (
                      <span className="text-[15px] text-[var(--sp-ink-2)]">None.</span>
                    )}
                  </dd>
                  <p className="mt-3 text-[13px] text-[var(--sp-ink-2)]">
                    Installed by the CLI when they are missing.
                  </p>
                </div>
              </dl>
            </SheetSection>

            {/* § 7 — customization */}
            <SheetSection
              id="customization"
              n="7"
              title="Customization"
              aside={`${component.customization.length} notes`}
            >
              <ol className="flex flex-col gap-14">
                {component.customization.map((example, exampleIndex) => (
                  <li key={example.title} className="grid gap-x-10 gap-y-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    <div>
                      <p className="sp-mono text-[12px] text-[var(--sp-ink-2)]">
                        7.{exampleIndex + 1}
                      </p>
                      <h3 className="mt-2 text-[21px] leading-[1.25] font-semibold tracking-[-0.015em]">
                        {example.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-[1.6] text-[var(--sp-ink-2)]">
                        <Prose text={example.description} />
                      </p>
                    </div>
                    <div className="sp-code min-w-0">
                      <CodeBlock code={example.code} language={example.language ?? "tsx"} />
                    </div>
                  </li>
                ))}
              </ol>
            </SheetSection>

            {/* Appendices */}
            <SheetSection id="usage" n="A" title="Appendix A — Usage">
              <div className="sp-code">
                <CodeBlock code={component.usage} language="tsx" title="example.tsx" />
              </div>
            </SheetSection>

            <SheetSection
              id="source"
              n="B"
              title="Appendix B — Source"
              aside={`${sources.length} ${sources.length === 1 ? "file" : "files"}`}
            >
              <div className="sp-code flex flex-col gap-6">
                {sources.map((source) => (
                  <CodeBlock
                    key={source.name}
                    code={source.content}
                    language={source.language}
                    title={source.target}
                    collapsible
                    showLineNumbers
                  />
                ))}
              </div>
            </SheetSection>

            <SheetSection id="prompt" n="C" title="Appendix C — Agent brief">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <p className="max-w-[58ch] text-[17px] leading-[1.6] text-[var(--sp-ink-2)]">
                    A brief for Claude Code, Cursor, Codex or any other coding agent, built
                    from this plate&apos;s record and its real source — it cannot describe a
                    prop the file does not have.
                  </p>
                  <div className="sp-btns">
                    <CopyPromptButton prompt={prompt} componentName={component.title} variant="primary" />
                  </div>
                </div>
                <div className="sp-code">
                  <CodeBlock
                    code={prompt}
                    language="text"
                    title={`${component.slug}.prompt.txt`}
                    collapsible
                    collapsedHeight={360}
                  />
                </div>
              </div>
            </SheetSection>
          </div>
        </div>
      </div>

      {/* ─── Related plates ──────────────────────────────────────────────── */}
      {related.length > 0 ? (
        <section
          aria-labelledby="related-title"
          data-running="Related plates"
          className="sp-wrap mt-32 lg:mt-40"
        >
          <div className="flex items-baseline justify-between border-t border-[var(--sp-ink)] pt-4">
            <h2 id="related-title" className="sp-label !text-[var(--sp-ink)]">
              See also
            </h2>
            <p className="sp-label">{related.length} plates</p>
          </div>
          <ul className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={href(`/components/${item.slug}`)} className="group block">
                  <div className="sp-board relative aspect-[4/3] overflow-hidden">
                    <Thumb slug={item.slug} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="sp-mono text-[12px] text-[var(--sp-ink-2)]">
                      PL. {plateNo(item.slug)}
                    </span>
                    <span className="text-[22px] font-semibold tracking-[-0.02em] underline-offset-[6px] group-hover:underline">
                      {item.title}
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] leading-[1.5] text-[var(--sp-ink-2)]">
                    {PURPOSE[item.slug]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ─── Previous / next plate ───────────────────────────────────────── */}
      <nav aria-label="Plates" className="sp-wrap mt-24 lg:mt-32">
        <div className="grid border-y border-[var(--sp-ink)] md:grid-cols-2">
          {previous ? (
            <Link
              href={href(`/components/${previous.slug}`)}
              className="group flex flex-col gap-3 border-b border-[var(--sp-rule)] py-8 md:border-r md:border-b-0 md:pr-8"
            >
              <span className="sp-label flex items-center gap-2">
                <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-x-1" />
                Previous · PL. {plateNo(previous.slug)}
              </span>
              <span className="sp-display text-[clamp(36px,4.4vw,64px)] leading-[0.95]">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span className="hidden md:block" />
          )}
          {next ? (
            <Link
              href={href(`/components/${next.slug}`)}
              className="group flex flex-col items-end gap-3 py-8 text-right md:pl-8"
            >
              <span className="sp-label flex items-center gap-2">
                Next · PL. {plateNo(next.slug)}
                <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="sp-display text-[clamp(36px,4.4vw,64px)] leading-[0.95]">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href={href("/")}
              className="group flex flex-col items-end gap-3 py-8 text-right md:pl-8"
            >
              <span className="sp-label flex items-center gap-2">
                Back to the cover
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
              <span className="sp-display text-[clamp(36px,4.4vw,64px)] leading-[0.95]">
                Contents
              </span>
            </Link>
          )}
        </div>
        <div className="sp-label mt-3 flex justify-between">
          <span>Join UI — Field manual</span>
          <span>
            p. {no} / {total}
          </span>
        </div>
      </nav>
    </main>
  )
}

function Spec({ term, value }: { term: string; value: string }) {
  return (
    <div className="border-[var(--sp-rule)] py-3 pr-4 not-first:border-l not-first:pl-4 max-sm:[&:nth-child(odd)]:border-l-0 max-sm:[&:nth-child(odd)]:pl-0 max-sm:[&:nth-child(n+3)]:border-t sm:max-lg:[&:nth-child(4n+1)]:border-l-0 sm:max-lg:[&:nth-child(4n+1)]:pl-0 sm:max-lg:[&:nth-child(n+5)]:border-t">
      <dt className="sp-label">{term}</dt>
      <dd className="mt-1 truncate text-[15px] font-medium">{value}</dd>
    </div>
  )
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: string
  title: string
  body: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="grid gap-x-10 gap-y-4 border-t border-[var(--sp-rule)] py-8 first:border-t-0 first:pt-0 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div>
        <p className="sp-mono text-[12px] text-[var(--sp-ink-2)]">{n}</p>
        <h3 className="mt-2 text-[21px] leading-[1.25] font-semibold tracking-[-0.015em]">
          {title}
        </h3>
        <p className="mt-2 max-w-[44ch] text-[15px] leading-[1.6] text-[var(--sp-ink-2)]">
          {body}
        </p>
      </div>
      <div className="sp-code flex min-w-0 flex-col gap-3">{children}</div>
    </li>
  )
}
