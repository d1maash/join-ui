import { ArrowUp, ChevronDown, GitBranch, MessageSquare, SquareTerminal, Terminal } from "lucide-react"

import { CopyPromptButton } from "@/components/site/copy-prompt-button"
import { cn } from "@/lib/utils"
import type { ComponentMetadata } from "@/types/registry"

/*
 * "Built for how you ship": one real brief, three places to paste it.
 *
 * The text in all three mock-ups is the same string — the generated prompt
 * for the newest component — and every number around it (line count, target
 * path, dependencies, rule counts) is read from that prompt's own inputs.
 * The mock-ups stop at the moment of pasting; nothing here claims what an
 * agent did with it afterwards.
 */
export function ShipSection({
  component,
  prompt,
  target,
}: {
  component: ComponentMetadata
  prompt: string
  target: string
}) {
  const lines = prompt.split("\n")
  const first = lines[0] ?? ""
  const stack = lines.slice(2, 7).join("\n")
  const deps = component.dependencies
  const propCount = component.props.reduce((total, group) => total + group.props.length, 0)
  const depText = deps.length > 0 ? deps.join(" and ") : "no new packages"

  const tools = [
    {
      name: "Claude Code",
      icon: SquareTerminal,
      line: `Paste it at the prompt. The brief tells it to add ${depText}, write ${target} and keep every accessibility rule intact.`,
      mock: (
        <div className="overflow-hidden rounded-xl border border-[var(--g-line-2)] bg-[#0a0a0c] font-mono text-[0.71875rem] leading-[1.6]">
          <div className="flex items-center gap-2 border-b border-[var(--g-line)] px-3 py-2 text-[var(--g-ink-4)]">
            <Terminal aria-hidden="true" className="size-3" />
            ~/your-app
          </div>
          <div className="flex flex-col gap-2.5 p-3">
            <div className="rounded-lg border border-[var(--g-line-2)] px-3 py-2.5 text-[var(--g-ink)]">
              <span className="text-[var(--g-ink-3)]">&gt; </span>
              {first}
              <br />
              <span className="text-[var(--g-accent-ink)]">
                [Pasted text #1 +{lines.length - 1} lines]
              </span>
              <span aria-hidden="true" className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-[var(--g-ink-2)]" />
            </div>
            <p className="px-1 text-[var(--g-ink-4)]">? for shortcuts</p>
          </div>
        </div>
      ),
    },
    {
      name: "Cursor",
      icon: MessageSquare,
      line: "Drop it into the agent chat. The full source rides along inline, so it works without the editor ever reaching the registry.",
      mock: (
        <div className="overflow-hidden rounded-xl border border-[var(--g-line-2)] bg-[var(--g-panel)] text-[0.75rem]">
          <div className="flex items-center gap-3 border-b border-[var(--g-line)] px-3 py-2 text-[var(--g-ink-3)]">
            <span className="text-[var(--g-ink)]">Chat</span>
            <span>History</span>
          </div>
          <div className="p-3">
            <div className="rounded-lg border border-[var(--g-line-2)] bg-[var(--g-panel-2)] p-2.5">
              <span className="mb-2 inline-flex items-center gap-1 rounded-md border border-[var(--g-line-2)] px-1.5 py-0.5 font-mono text-[0.625rem] text-[var(--g-ink-3)]">
                {component.slug}.prompt.txt
              </span>
              <p className="text-[var(--g-ink)]">{first}</p>
              <p className="mt-1 line-clamp-2 whitespace-pre-line text-[var(--g-ink-3)]">{stack}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--g-panel-3)] px-1.5 py-0.5 text-[0.6875rem] text-[var(--g-ink-2)]">
                  Agent <ChevronDown aria-hidden="true" className="size-3" />
                </span>
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--g-ink)] text-[var(--g-bg)]">
                  <ArrowUp aria-hidden="true" className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Codex",
      icon: GitBranch,
      line: "Send it as a task. Strict TypeScript and “do not modify unrelated files” are written into the brief, so the diff stays reviewable.",
      mock: (
        <div className="overflow-hidden rounded-xl border border-[var(--g-line-2)] bg-[var(--g-panel)] p-3 text-[0.75rem]">
          <p className="mb-2 px-0.5 text-[0.6875rem] text-[var(--g-ink-4)]">New task</p>
          <div className="rounded-lg border border-[var(--g-line-2)] bg-[var(--g-bg-2)] p-2.5">
            <p className="line-clamp-4 whitespace-pre-line text-[var(--g-ink-2)]">
              <span className="text-[var(--g-ink)]">{first}</span>
              {"\n"}
              {stack}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-md border border-[var(--g-line-2)] px-1.5 py-0.5 font-mono text-[0.625rem] text-[var(--g-ink-3)]">
                <GitBranch aria-hidden="true" className="size-3 shrink-0" />
                your-app · main
              </span>
              <span className="rounded-md bg-[var(--g-ink)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--g-bg)]">
                Code
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const facts = [
    { label: "Writes", value: target, mono: true },
    { label: "Installs", value: deps.length > 0 ? deps.join(", ") : "Nothing new", mono: deps.length > 0 },
    { label: "Documents", value: `${propCount} props` },
    {
      label: "Must keep",
      value: `${component.accessibility.length} accessibility rules${component.keyboard.length > 0 ? `, ${component.keyboard.length} key bindings` : ""}`,
    },
  ]

  return (
    <section aria-labelledby="ship" className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="ship" className="g-title text-[1.875rem] text-[var(--g-ink)] sm:text-[2.375rem]">
            Built for how you ship
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-[var(--g-ink-3)]">
            Every component carries one brief, and it is the same text wherever you paste it.
            The one below is the real brief for{" "}
            <span className="text-[var(--g-ink)]">{component.title}</span>:{" "}
            <span className="g-num">{lines.length}</span> lines, generated from its metadata and
            its source file.
          </p>
        </div>
        <span className="g-accent-scope">
          <CopyPromptButton prompt={prompt} componentName={component.title} variant="primary" size="md" />
        </span>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <li
            key={tool.name}
            className="flex flex-col gap-5 rounded-2xl border border-[var(--g-line)] bg-[linear-gradient(to_bottom,var(--g-panel-2),var(--g-panel)_40%)] p-4 sm:p-5"
          >
            <div aria-hidden="true" inert className="select-none">
              {tool.mock}
            </div>
            <div className="mt-auto">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[-0.016em] text-[var(--g-ink)]">
                <tool.icon aria-hidden="true" className="size-4 text-[var(--g-ink-3)]" />
                {tool.name}
              </h3>
              <p className="mt-1.5 text-[0.84375rem] leading-relaxed text-[var(--g-ink-3)]">{tool.line}</p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--g-line)] lg:grid-cols-4">
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={cn(
              "flex min-w-0 flex-col gap-1 border-[var(--g-line)] px-4 py-3.5",
              index % 2 === 1 && "border-l",
              index >= 2 && "border-t lg:border-t-0",
              index === 2 && "lg:border-l"
            )}
          >
            <dt className="text-[0.75rem] text-[var(--g-ink-4)]">{fact.label}</dt>
            <dd
              className={cn(
                "truncate text-[0.875rem] text-[var(--g-ink-2)]",
                fact.mono && "font-mono text-[0.8125rem]"
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
