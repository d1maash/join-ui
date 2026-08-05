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

/**
 * The component's own design tokens, as CSS ready to paste.
 *
 * The registry item carries these so `shadcn add` can write them into the
 * consumer's stylesheet, but an agent working from this prompt is taking the
 * other route — it is pasting the source — and would otherwise land a component
 * whose colours resolve to nothing. Both themes are emitted, because a
 * component that themes purely through custom properties has no other way to
 * cover the dark one.
 */
function formatTokens(component: ComponentMetadata): string | null {
  const vars = component.cssVars
  if (!vars) return null

  const block = (selector: string, entries?: Record<string, string>) => {
    if (!entries || Object.keys(entries).length === 0) return null
    const body = Object.entries(entries)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join("\n")
    return `${selector} {\n${body}\n}`
  }

  const blocks = [
    block("@theme inline", vars.theme),
    block(":root,\n.light", vars.light),
    block(".dark", vars.dark),
  ].filter((entry): entry is string => entry !== null)

  if (blocks.length === 0) return null

  return `Design tokens:
- The implementation below reads the custom properties in this block. Add any the project does not already declare to its global stylesheet, keeping both themes — the component carries no \`dark:\` variants, so the dark theme exists only here.
- Values already present in the project win: match the names, not these numbers.

\`\`\`css
${blocks.join("\n\n")}
\`\`\``
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

  const tokens = formatTokens(component)

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
- Use the project's existing \`cn\` utility from \`@/lib/utils\` and its existing design tokens (background, foreground, card, muted, border, primary, accent, destructive, radius, plus the component colour families info, positive, caution and critical — each with a \`-soft\` tint and a \`-foreground\`, as in \`bg-info-soft text-info\`). Round corners with the \`rounded-soft-sm\` / \`rounded-soft\` / \`rounded-soft-lg\` scale. Do not introduce new hard-coded colours, and do not reach for Tailwind's built-in palette (\`gray-500\`, \`red-600\`) — the tokens are warm neutrals and low-chroma hues, so those land next to but not on the system. A colour the caller hands in through a prop is not a hard-coded colour: where the implementation takes one, that API stays.
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
${tokens ? `\n${tokens}\n` : ""}

Keyboard interactions:
${formatKeyboard(component)}

Animation requirements:
- Reach for transform and opacity first: they are the two the compositor carries on its own, and they are what most of the motion below is built from.
- Where the implementation animates something costlier than those — a filter, a backdrop filter, a shadow — it is deliberate, bounded, and usually behind a prop or a token that turns it off. Keep both the effect and the escape hatch rather than optimising the effect away.
- Add no motion of your own, and take none away. Mount animations, loops at rest, hover responses and springs belong in the result exactly where the implementation below has them — copy what is there rather than deciding for yourself which of them a component of this kind ought to have.
- Where motion is derived from a shared value — one spring read by several elements, a velocity several transforms are computed from — keep it shared. Recreating it per element is not equivalent: independent springs with identical settings still drift apart by a frame, which is visible.
- Pause or skip animation when the element is outside the viewport where the implementation already does so.
- Every animation must degrade to a static, fully functional state under reduced motion, and it must do so the way the implementation does it — by not starting the animation rather than by shortening its duration.

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
