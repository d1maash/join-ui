import "server-only"

import { createHighlighter, type Highlighter } from "shiki"

import { joinuiDark, joinuiLight } from "@/lib/shiki-theme"

export const SUPPORTED_LANGUAGES = [
  "tsx",
  "typescript",
  "jsx",
  "javascript",
  "json",
  "bash",
  "css",
  "html",
  "mdx",
  "markdown",
  "diff",
  "text",
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const ALIASES: Record<string, SupportedLanguage> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  md: "markdown",
  txt: "text",
  plaintext: "text",
  prompt: "text",
}

export function normalizeLanguage(language: string | undefined): SupportedLanguage {
  if (!language) return "text"
  const lower = language.toLowerCase()
  if (lower in ALIASES) return ALIASES[lower] as SupportedLanguage
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lower)
    ? (lower as SupportedLanguage)
    : "text"
}

/**
 * One highlighter for the whole build. `createHighlighter` loads WASM and
 * grammars, which is far too expensive to repeat per code block.
 */
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [joinuiLight, joinuiDark],
    langs: [...SUPPORTED_LANGUAGES],
  })
  return highlighterPromise
}

export interface HighlightOptions {
  language?: string
  /** 1-based line numbers to emphasise. */
  highlightLines?: number[]
}

/**
 * Renders code to dual-theme HTML.
 *
 * `defaultColor: false` emits both `--shiki-light` and `--shiki-dark` custom
 * properties per token, so one HTML payload serves light and dark with no
 * client-side re-highlighting and no flash on theme change.
 */
export async function highlightCode(
  code: string,
  { language, highlightLines = [] }: HighlightOptions = {}
): Promise<string> {
  const lang = normalizeLanguage(language)
  const highlighter = await getHighlighter()
  const emphasised = new Set(highlightLines)

  return highlighter.codeToHtml(code.replace(/\n$/, ""), {
    lang,
    themes: { light: "joinui-light", dark: "joinui-dark" },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          // Shiki's inline background would fight the design tokens.
          node.properties.style = ""
          this.addClassToHast(node, "shiki")
        },
        line(node, line) {
          if (emphasised.has(line)) this.addClassToHast(node, "highlighted")
        },
      },
    ],
  })
}

/**
 * Parses a fenced-code meta string such as
 * `title="button.tsx" {2,5-7} showLineNumbers`.
 */
export function parseCodeMeta(meta: string | undefined) {
  if (!meta) return { title: undefined, highlightLines: [], showLineNumbers: false }

  const title = /title="([^"]*)"/.exec(meta)?.[1]
  const showLineNumbers = /\bshowLineNumbers\b/.test(meta)

  const highlightLines: number[] = []
  const rangeMatch = /\{([\d,\s-]+)\}/.exec(meta)?.[1]
  if (rangeMatch) {
    for (const part of rangeMatch.split(",")) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const [rawStart, rawEnd] = trimmed.split("-")
      const start = Number.parseInt(rawStart ?? "", 10)
      if (Number.isNaN(start)) continue
      const end = rawEnd ? Number.parseInt(rawEnd, 10) : start
      for (let line = start; line <= (Number.isNaN(end) ? start : end); line += 1) {
        highlightLines.push(line)
      }
    }
  }

  return { title, highlightLines, showLineNumbers }
}
