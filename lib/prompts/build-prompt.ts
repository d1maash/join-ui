import { siteConfig } from "@/lib/site"
import type { ComponentMetadata } from "@/types/registry"

export interface PromptSource {
  /** Destination path inside the consumer project. */
  target: string
  content: string
  language?: string
}

export interface BuildPromptOptions {
  component: ComponentMetadata
  sources: PromptSource[]
  /** Absolute origin, used to spell out the registry URL. */
  siteUrl?: string
}

function bullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None."
}

function formatProps(component: ComponentMetadata): string {
  return component.props
    .map((group) => {
      const header = component.props.length > 1 ? `${group.name}:\n` : ""
      const rows = group.props
        .map((prop) => {
          const required = prop.required ? " (required)" : ""
          const fallback = prop.defaultValue ? ` — default: ${prop.defaultValue}` : ""
          return `- ${prop.name}: ${prop.type}${required}${fallback}. ${prop.description}`
        })
        .join("\n")
      return `${header}${rows}`
    })
    .join("\n\n")
}

function formatKeyboard(component: ComponentMetadata): string {
  if (component.keyboard.length === 0) {
    return "- Not applicable: the component exposes no interactive controls of its own."
  }
  return component.keyboard
    .map((entry) => `- ${entry.keys.join(" / ")}: ${entry.description}`)
    .join("\n")
}

/**
 * Assembles the prompt handed to Cursor, Claude Code, Codex or any other coding
 * agent.
 *
 * Everything here is projected from `ComponentMetadata` plus the real source
 * file, so a prompt can never describe props the component does not have. Set
 * `prompt` on the metadata to override the generated text wholesale.
 */
export function buildComponentPrompt({
  component,
  sources,
  siteUrl = siteConfig.url,
}: BuildPromptOptions): string {
  if (component.prompt) return component.prompt

  const primaryTarget =
    component.files[0]?.target ?? `${siteConfig.installTarget}/${component.slug}.tsx`
  const registryUrl = `${siteUrl}/r/${component.slug}.json`

  const dependencies =
    component.dependencies.length > 0
      ? component.dependencies.join(", ")
      : "none beyond what the project already has"

  const registryDependencies =
    component.registryDependencies.length > 0
      ? component.registryDependencies.join(", ")
      : "none"

  const implementation = sources
    .map(
      (source) =>
        `File: ${source.target}\n\n\`\`\`${source.language ?? "tsx"}\n${source.content.trim()}\n\`\`\``
    )
    .join("\n\n")

  return `Add the ${component.name} component to my existing Next.js application.

Project stack:
- Next.js (App Router)
- React 19 with Server Components
- TypeScript in strict mode
- Tailwind CSS v4 with CSS-variable design tokens
- shadcn/ui conventions (open code, \`cn\` utility, \`components.json\`)

Requirements:
- Install all required dependencies: ${dependencies}.
- Place the component at ${primaryTarget}.
- Use the project's existing \`cn\` utility from \`@/lib/utils\` and its existing design tokens (background, foreground, card, muted, border, primary, accent, destructive, radius, plus the component colour families info, positive, caution and critical — each with a \`-soft\` tint and a \`-foreground\`, as in \`bg-info-soft text-info\`). Round corners with the \`rounded-soft-sm\` / \`rounded-soft\` / \`rounded-soft-lg\` scale. Do not introduce new hard-coded colours, and do not reach for Tailwind's built-in palette (\`gray-500\`, \`red-600\`) — the tokens are warm neutrals and low-chroma hues, so those land next to but not on the system.
- Preserve dark mode support. The component must theme through CSS variables only — do not add \`dark:\` variants, so it keeps working inside a forced-theme preview.
- Preserve keyboard navigation and every ARIA attribute in the implementation below.
- Respect \`prefers-reduced-motion: reduce\`.
- Keep TypeScript strict mode passing. Export the prop types.
- Mark the file \`"use client"\` only if the implementation below does.
- Do not modify unrelated files.
- Do not replace existing project configuration unless it is genuinely required.
- Return a summary of created and modified files.

Component behavior:
${component.overview}

Registry dependencies (install these first if missing): ${registryDependencies}.

Supported props:
${formatProps(component)}

Accessibility requirements:
${bullets(component.accessibility)}

Keyboard interactions:
${formatKeyboard(component)}

Animation requirements:
- Animate compositor-friendly properties (transform, opacity) only.
- Pause or skip animation when the element is outside the viewport where the implementation already does so.
- Every animation must degrade to a static, fully functional state under reduced motion.

Integration notes:
- Category: ${component.category}
- Registry item: ${registryUrl}
- Equivalent CLI install: ${component.installCommand}
- If the project already uses the shadcn CLI, prefer running the install command above instead of pasting the code.

Usage example:

\`\`\`tsx
${component.usage.trim()}
\`\`\`

Implementation:

${implementation}
`
}
