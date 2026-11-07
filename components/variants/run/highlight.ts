import "server-only"

import { createHighlighter, type Highlighter } from "shiki"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

import { normalizeLanguage, SUPPORTED_LANGUAGES } from "@/lib/highlight"
import { joinuiDark, joinuiLight } from "@/lib/shiki-theme"

/*
 * The same themes and languages as `lib/highlight`, on Shiki's JavaScript
 * regex engine instead of the Oniguruma WASM one. The output is identical;
 * what changes is that nothing here shares a WASM heap with every other page
 * the dev server is rendering, so one bad compile elsewhere cannot take these
 * listings down with it. Fold back into `lib/highlight` when the variant is
 * promoted.
 */
let highlighter: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [joinuiLight, joinuiDark],
    langs: [...SUPPORTED_LANGUAGES],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
  return highlighter
}

export async function highlight(code: string, language?: string): Promise<string> {
  const lang = normalizeLanguage(language)
  const instance = await getHighlighter()
  return instance.codeToHtml(code.replace(/\n$/, ""), {
    lang,
    themes: { light: "joinui-light", dark: "joinui-dark" },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          node.properties.style = ""
          this.addClassToHast(node, "shiki")
        },
      },
    ],
  })
}
