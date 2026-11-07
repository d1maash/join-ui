import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Code2, ExternalLink, Maximize2 } from "lucide-react"

import { IxCell } from "@/components/variants/index/cell"
import { IxCode } from "@/components/variants/index/code"
import { formatDate } from "@/components/variants/index/codes"
import { IxCommand } from "@/components/variants/index/command"
import { IxCopyButton, IxCopyPrompt } from "@/components/variants/index/copy"
import { getIxItem, getIxNav, ixHref } from "@/components/variants/index/data"
import { Inline, IxCrumbs, IxPager, IxSection } from "@/components/variants/index/page-parts"
import { IxPreviewBox, IxShowCodeButton } from "@/components/variants/index/preview-box"
import { IxDocsShell } from "@/components/variants/index/shell"
import { IxTabs } from "@/components/variants/index/tabs"
import { IxToc, type IxTocEntry } from "@/components/variants/index/toc"
import { dependencyCommands, shadcnCommands } from "@/lib/commands"
import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent, getRelated } from "@/lib/registry"
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
  if (!component) return { title: "Not found", robots: { index: false } }
  return {
    title: component.title,
    description: component.description,
    robots: { index: false, follow: false },
  }
}

export default async function IndexComponentPage({ params }: PageProps) {
  const { slug } = await params
  const component = getComponent(slug)
  const item = getIxItem(slug)
  if (!component || !item) notFound()

  const sources = await getComponentSources(component)
  const primary = sources[0]
  if (!primary) notFound()

  const nav = getIxNav()
  const prompt = buildComponentPrompt({ component, sources })
  const related = getRelated(component)
    .map((entry) => getIxItem(entry.slug))
    .filter((entry) => entry !== undefined)

  /* Previous and next follow the sidebar: category by category, in code order. */
  const order = nav.groups.flatMap((group) => group.items)
  const at = order.findIndex((entry) => entry.slug === slug)
  const previous = at > 0 ? order[at - 1] : undefined
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : undefined

  const registryTarget = `${siteConfig.namespace}/${component.slug}`
  const registryUrl = `${siteConfig.url}/r/${component.slug}.json`
  const sourceUrl = `${siteConfig.links.repo}/blob/main/${primary.path}`
  const propCount = component.props.reduce((sum, group) => sum + group.props.length, 0)

  const sections: Array<IxTocEntry & { show: boolean }> = [
    { id: "overview", title: "Overview", level: 2, show: true },
    { id: "installation", title: "Installation", level: 2, show: true },
    { id: "usage", title: "Usage", level: 2, show: true },
    { id: "examples", title: "Examples", level: 2, show: component.customization.length > 0 },
    { id: "props", title: "Props", level: 2, show: true },
    { id: "accessibility", title: "Accessibility", level: 2, show: true },
    { id: "keyboard", title: "Keyboard", level: 2, show: true },
    { id: "dependencies", title: "Dependencies", level: 2, show: true },
    { id: "prompt", title: "Agent prompt", level: 2, show: true },
    { id: "related", title: "Related", level: 2, show: related.length > 0 },
  ]
  const shown = sections.filter((section) => section.show)
  const number = (id: string) => shown.findIndex((section) => section.id === id) + 1

  const toc = [{ id: "preview", title: "Preview", level: 2 as const }, ...shown.map(({ id, title, level }) => ({ id, title, level }))]

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <IxDocsShell
        nav={nav}
        aside={
          <div className="flex flex-col gap-8">
            <IxToc entries={toc} />
            <div>
              <p className="ix-mono ix-fg-3 mb-2 text-[0.6875rem] tracking-[0.04em] uppercase">Record</p>
              <dl className="ix-mono grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[0.75rem]">
                <dt className="ix-fg-3">code</dt>
                <dd className="ix-accent">{item.code}</dd>
                <dt className="ix-fg-3">since</dt>
                <dd className="text-[var(--ix-fg-2)]">{formatDate(component.since)}</dd>
                {component.updated ? (
                  <>
                    <dt className="ix-fg-3">updated</dt>
                    <dd className="text-[var(--ix-fg-2)]">{formatDate(component.updated)}</dd>
                  </>
                ) : null}
                <dt className="ix-fg-3">props</dt>
                <dd className="text-[var(--ix-fg-2)]">{propCount}</dd>
                <dt className="ix-fg-3">files</dt>
                <dd className="text-[var(--ix-fg-2)]">{sources.length}</dd>
              </dl>
            </div>
            <div className="flex flex-col gap-1.5">
              <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="ix-mono ix-fg-3 hover:text-[var(--ix-fg)]">
                Edit on GitHub ↗
              </a>
              <a href={siteConfig.links.issues} target="_blank" rel="noreferrer noopener" className="ix-mono ix-fg-3 hover:text-[var(--ix-fg)]">
                Report an issue ↗
              </a>
            </div>
          </div>
        }
      >
        {/* ---------------------------------------------------------- head */}
        <header className="ix-rule-b px-5 pt-7 pb-8 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <IxCrumbs
              items={[
                { label: "Components", href: ixHref("/components") },
                {
                  label: component.category,
                  href: ixHref(`/components?category=${encodeURIComponent(component.category)}`),
                },
                { label: item.code },
              ]}
            />
            <div className="flex items-center gap-1">
              {previous ? (
                <Link href={previous.href} className="ix-icon-btn !size-7 border border-[var(--ix-line-2)]" aria-label={`Previous: ${previous.title}`}>
                  <ArrowLeft aria-hidden="true" className="!size-3.5" />
                </Link>
              ) : null}
              {next ? (
                <Link href={next.href} className="ix-icon-btn !size-7 border border-[var(--ix-line-2)]" aria-label={`Next: ${next.title}`}>
                  <ArrowRight aria-hidden="true" className="!size-3.5" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-1.5">
            <span className="ix-badge !border-[var(--ix-accent-line)] !text-[var(--ix-accent)]">{item.code}</span>
            <span className="ix-badge">{component.category}</span>
            <span
              className="ix-badge"
              data-badge={component.status === "new" ? "New" : component.status === "experimental" ? "Experimental" : undefined}
            >
              {component.status}
            </span>
            {component.updated ? (
              <span className="ix-badge" data-badge="Updated">
                updated {formatDate(component.updated)}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-[2.25rem] leading-[1.02] font-semibold tracking-[-0.045em] md:text-[2.875rem]">
            {component.title}
          </h1>
          <p className="ix-fg-2 mt-3 max-w-[60ch] text-base leading-relaxed text-pretty">{component.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <IxCopyPrompt prompt={prompt} title={component.title} primary />
            <IxCopyButton
              value={component.installCommand}
              label="Copy install"
              copiedLabel="Copied"
              toastMessage="Install command copied"
            />
            <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="ix-btn ix-btn-ghost">
              <ExternalLink aria-hidden="true" />
              Source
              <span className="sr-only"> on GitHub (opens in a new tab)</span>
            </a>
            <Link href={`/preview/${component.slug}`} className="ix-btn ix-btn-ghost">
              <Maximize2 aria-hidden="true" />
              Full screen
            </Link>
          </div>
        </header>

        {/* ------------------------------------------------------- preview */}
        <h2 className="sr-only">Preview</h2>
        <IxPreviewBox
          slug={component.slug}
          title={component.title}
          code={
            sources.length === 1 ? (
              <IxCode code={primary.content} language={primary.language} title={primary.target} lineNumbers collapsible collapsedLines={28} bare />
            ) : (
              <IxTabs
                label={`${component.title} source files`}
                barClassName="px-5 md:px-8"
                items={await Promise.all(
                  sources.map(async (source) => ({
                    id: source.name,
                    label: source.name,
                    content: (
                      <IxCode code={source.content} language={source.language} title={source.target} lineNumbers collapsible collapsedLines={28} bare />
                    ),
                  }))
                )}
              />
            )
          }
        />

        {/* ------------------------------------------------------ overview */}
        <IxSection id="overview" index={number("overview")} title="Overview">
          <p className="ix-fg-2 max-w-[68ch] text-[0.9375rem] leading-[1.75] text-pretty">{component.overview}</p>
          {component.tags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tags">
              {component.tags.map((tag) => (
                <li key={tag} className="ix-mono ix-fg-3 rounded-[3px] border border-[var(--ix-line)] px-1.5 py-0.5 text-[0.6875rem]">
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}
        </IxSection>

        {/* -------------------------------------------------- installation */}
        <IxSection id="installation" index={number("installation")} title="Installation">
          <IxTabs
            label="Installation method"
            items={[
              {
                id: "cli",
                label: "CLI",
                content: (
                  <div className="flex flex-col gap-3 pt-5">
                    <p className="ix-fg-2 text-[0.875rem] leading-relaxed">
                      Writes <code className="text-[var(--ix-fg)]">{primary.target}</code> and installs what it needs. Needs the{" "}
                      <code className="text-[var(--ix-fg)]">{siteConfig.namespace}</code> namespace in{" "}
                      <code className="text-[var(--ix-fg)]">components.json</code> —{" "}
                      <Link href={ixHref("/docs/registry-setup")} className="text-[var(--ix-fg)] underline decoration-[var(--ix-line-3)] underline-offset-4 hover:decoration-[var(--ix-accent)]">
                        registry setup
                      </Link>
                      .
                    </p>
                    <IxCommand commands={shadcnCommands(registryTarget)} label="Package manager" />
                  </div>
                ),
              },
              {
                id: "url",
                label: "URL",
                content: (
                  <div className="flex flex-col gap-3 pt-5">
                    <p className="ix-fg-2 text-[0.875rem] leading-relaxed">
                      No namespace to configure: the registry item is a static JSON file, so the CLI can read it straight from its URL.
                    </p>
                    <IxCommand commands={shadcnCommands(registryUrl)} label="Package manager" />
                  </div>
                ),
              },
              {
                id: "manual",
                label: "Manual",
                content: (
                  <div className="flex flex-col gap-4 pt-5">
                    <ol className="flex flex-col gap-4">
                      <li className="flex flex-col gap-3">
                        <p className="ix-fg-2 text-[0.875rem]">
                          <span className="ix-mono ix-accent mr-2">01</span>
                          {component.dependencies.length > 0 ? "Install the dependencies." : "No packages to install — React and Tailwind are enough."}
                        </p>
                        {component.dependencies.length > 0 ? (
                          <IxCommand commands={dependencyCommands(component.dependencies)} label="Package manager" />
                        ) : null}
                      </li>
                      <li className="flex flex-col gap-3">
                        <p className="ix-fg-2 text-[0.875rem]">
                          <span className="ix-mono ix-accent mr-2">02</span>
                          Copy the source into <code className="text-[var(--ix-fg)]">{primary.target}</code>.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <IxCopyButton value={primary.content} label="Copy the source" toastMessage="Source copied" />
                          <IxShowCodeButton>
                            <Code2 aria-hidden="true" />
                            Read it in Code
                          </IxShowCodeButton>
                        </div>
                      </li>
                    </ol>
                  </div>
                ),
              },
            ]}
          />
        </IxSection>

        {/* --------------------------------------------------------- usage */}
        <IxSection id="usage" index={number("usage")} title="Usage">
          <IxCode code={component.usage} language="tsx" title="example.tsx" />
        </IxSection>

        {/* ------------------------------------------------------ examples */}
        {component.customization.length > 0 ? (
          <IxSection
            id="examples"
            index={number("examples")}
            title="Examples"
            aside={`${component.customization.length} recipes · shown as code`}
          >
            <div className="flex flex-col gap-6">
              {component.customization.map((example, index) => (
                <div key={example.title} className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="ix-mono ix-fg-3">EX-{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-[0.9375rem] font-semibold tracking-[-0.015em]">{example.title}</h3>
                      <p className="ix-fg-2 mt-1 max-w-[68ch] text-[0.875rem] leading-relaxed">
                        <Inline text={example.description} />
                      </p>
                    </div>
                  </div>
                  <IxCode code={example.code} language={example.language ?? "tsx"} title={`${component.slug}.example-${index + 1}.${example.language === "css" ? "css" : "tsx"}`} collapsible collapsedLines={16} />
                </div>
              ))}
            </div>
          </IxSection>
        ) : null}

        {/* --------------------------------------------------------- props */}
        <IxSection id="props" index={number("props")} title="Props" aside={`${propCount} props`}>
          {component.props.length === 0 ? (
            <p className="ix-fg-2 text-[0.9375rem]">{component.title} takes no props.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {component.props.map((group) => (
                <div key={group.name} className="flex flex-col gap-2.5">
                  <div>
                    <h3 className="ix-mono text-[0.8125rem] text-[var(--ix-fg)]">{`<${group.name} />`}</h3>
                    {group.description ? <p className="ix-fg-3 mt-1 text-[0.8125rem] leading-relaxed">{group.description}</p> : null}
                  </div>
                  <div className="ix-table-wrap">
                    <table className="ix-table">
                      <caption className="sr-only">Props for {group.name}</caption>
                      <thead>
                        <tr>
                          <th scope="col">Prop</th>
                          <th scope="col">Type</th>
                          <th scope="col">Default</th>
                          <th scope="col" className="w-[45%]">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.props.map((prop) => (
                          <tr key={prop.name}>
                            <th scope="row" className="ix-mono !text-[0.75rem] whitespace-nowrap !text-[var(--ix-fg)]">
                              {prop.name}
                              {prop.required ? (
                                <>
                                  <span aria-hidden="true" className="ix-accent">*</span>
                                  <span className="sr-only"> (required)</span>
                                </>
                              ) : null}
                            </th>
                            <td className="ix-mono !text-[0.75rem] break-words">{prop.type}</td>
                            <td className="ix-mono !text-[0.75rem]">{prop.defaultValue ?? "—"}</td>
                            <td className="!text-[0.8125rem]">
                              <Inline text={prop.description} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </IxSection>

        {/* ------------------------------------------------- accessibility */}
        <IxSection id="accessibility" index={number("accessibility")} title="Accessibility" aside="WCAG 2.2 AA">
          <ol className="border border-[var(--ix-line)] bg-[var(--ix-cell)]">
            {component.accessibility.map((note, index) => (
              <li key={note} className="flex gap-4 border-b border-[var(--ix-line)] px-4 py-3 last:border-b-0">
                <span className="ix-mono ix-fg-3 pt-0.5">A{String(index + 1).padStart(2, "0")}</span>
                <p className="ix-fg-2 text-[0.875rem] leading-relaxed">
                  <Inline text={note} />
                </p>
              </li>
            ))}
          </ol>
        </IxSection>

        {/* ------------------------------------------------------ keyboard */}
        <IxSection id="keyboard" index={number("keyboard")} title="Keyboard">
          {component.keyboard.length > 0 ? (
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Keyboard interactions for {component.title}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-48">Keys</th>
                    <th scope="col">Behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  {component.keyboard.map((entry) => (
                    <tr key={entry.keys.join("+")}>
                      <th scope="row" className="whitespace-nowrap">
                        <span className="flex flex-wrap items-center gap-1">
                          {entry.keys.map((key) => (
                            <kbd key={key} className="ix-kbd ix-kbd-lg">
                              {key}
                            </kbd>
                          ))}
                        </span>
                      </th>
                      <td className="!text-[0.8125rem]">
                        <Inline text={entry.description} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ix-fg-2 max-w-[68ch] text-[0.9375rem] leading-relaxed">
              {component.title} renders no controls of its own, so it adds nothing to the tab order.
            </p>
          )}
        </IxSection>

        {/* -------------------------------------------------- dependencies */}
        <IxSection id="dependencies" index={number("dependencies")} title="Dependencies">
          <div className="grid border border-[var(--ix-line)] sm:grid-cols-2">
            {[
              { title: "npm packages", items: component.dependencies, empty: "None — React and Tailwind only." },
              {
                title: "Registry items",
                items: component.registryDependencies,
                empty: "None.",
                note: "Added by the CLI when missing.",
              },
            ].map((panel, index) => (
              <div
                key={panel.title}
                className={
                  "flex flex-col gap-3 bg-[var(--ix-cell)] px-4 py-4 " +
                  (index === 0 ? "border-b border-[var(--ix-line)] sm:border-r sm:border-b-0" : "")
                }
              >
                <p className="ix-mono ix-fg-3 text-[0.6875rem] tracking-[0.04em] uppercase">{panel.title}</p>
                {panel.items.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {panel.items.map((dependency) => (
                      <li key={dependency} className="ix-mono rounded-[3px] border border-[var(--ix-line-2)] px-2 py-1 text-[var(--ix-fg)]">
                        {dependency}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ix-fg-2 text-[0.875rem]">{panel.empty}</p>
                )}
                {panel.note ? <p className="ix-fg-3 text-[0.75rem]">{panel.note}</p> : null}
              </div>
            ))}
          </div>
          {component.dependencies.length > 0 ? (
            <IxCommand commands={dependencyCommands(component.dependencies)} label="Package manager" className="mt-3" />
          ) : null}
        </IxSection>

        {/* -------------------------------------------------------- prompt */}
        <IxSection id="prompt" index={number("prompt")} title="Agent prompt">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <p className="ix-fg-2 max-w-[58ch] text-[0.875rem] leading-relaxed">
              A brief for Claude Code, Cursor or Codex, generated from this component&apos;s metadata and its real source — the stack, the target path, every prop, the accessibility rules and the file itself.
            </p>
            <IxCopyPrompt prompt={prompt} title={component.title} />
          </div>
          <IxCode code={prompt} language="text" title={`${component.slug}.prompt.txt`} collapsible collapsedLines={14} />
        </IxSection>

        {/* ------------------------------------------------------- related */}
        {related.length > 0 ? (
          <section aria-labelledby="related" className="ix-rule-b">
            <div className="flex items-baseline gap-3 px-5 pt-9 pb-5 md:px-8 md:pt-10">
              <span className="ix-mono ix-fg-3 w-6 shrink-0">{String(number("related")).padStart(2, "0")}</span>
              <h2 id="related" className="scroll-mt-20 text-[1.25rem] font-semibold tracking-[-0.025em]">
                Related
              </h2>
            </div>
            <div className="border-t border-[var(--ix-line)]">
              <ul className="ix-cells" data-cols="3" data-narrow="">
                {related.map((entry) => (
                  <li key={entry.id} className="flex">
                    <IxCell item={entry} className="w-full" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <IxPager
          label="Component navigation"
          previous={previous ? { title: previous.title, href: previous.href, code: previous.code } : undefined}
          next={next ? { title: next.title, href: next.href, code: next.code } : undefined}
        />
      </IxDocsShell>
    </main>
  )
}
