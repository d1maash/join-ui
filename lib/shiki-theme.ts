import type { ThemeRegistrationRaw } from "shiki"

/**
 * Syntax themes.
 *
 * Xcode's own two themes, "Default (Light)" and "Default (Dark)", so a listing
 * on this site reads the way the same code would in Apple's editor: keywords
 * in magenta, strings in red, numbers in blue (light) or gold (dark), types in
 * teal-blue, comments in a cool grey.
 *
 * Six roles carry the whole grammar:
 *   keyword   — control flow and declarations
 *   entity    — functions and the things being called
 *   type      — types, classes and JSX tags
 *   string    — strings and template literals
 *   number    — numeric and language constants, JSX attributes
 *   comment   — italic, the quietest thing on the line
 *
 * Every value clears 4.5:1 against its own theme's code background (white and
 * #1c1c1e), so the grammar stays legible for anyone reading in greyscale.
 */
interface Ramp {
  plain: string
  keyword: string
  entity: string
  type: string
  string: string
  number: string
  comment: string
  punctuation: string
  deleted: string
  background: string
}

const LIGHT: Ramp = {
  plain: "#1d1d1f",
  keyword: "#9b2393",
  entity: "#326d74",
  type: "#0b4f79",
  string: "#c41a16",
  number: "#1c00cf",
  comment: "#5d6c79",
  punctuation: "#424245",
  deleted: "#c41a16",
  background: "transparent",
}

const DARK: Ramp = {
  plain: "#f5f5f7",
  keyword: "#ff7ab2",
  entity: "#67b7a4",
  type: "#5dd8ff",
  string: "#ff8170",
  number: "#d9c97c",
  comment: "#8e9aa6",
  punctuation: "#c7c7cc",
  deleted: "#ff8170",
  background: "transparent",
}

function buildTheme(name: string, type: "light" | "dark", ramp: Ramp) {
  return {
    name,
    type,
    colors: {
      "editor.background": ramp.background,
      "editor.foreground": ramp.plain,
    },
    settings: [
      { settings: { foreground: ramp.plain, background: ramp.background } },

      {
        scope: ["comment", "punctuation.definition.comment", "string.comment"],
        settings: { foreground: ramp.comment, fontStyle: "italic" },
      },

      {
        scope: [
          "keyword",
          "keyword.control",
          "keyword.operator.new",
          "keyword.operator.expression",
          "storage",
          "storage.type",
          "storage.modifier",
          "variable.language",
        ],
        settings: { foreground: ramp.keyword, fontStyle: "bold" },
      },

      {
        scope: [
          "entity.name.function",
          "support.function",
          "meta.function-call.generic",
          "entity.name.label",
        ],
        settings: { foreground: ramp.entity },
      },

      {
        scope: [
          "entity.name.type",
          "entity.name.class",
          "entity.other.inherited-class",
          "support.class",
          "support.type",
          "entity.name.tag",
          "entity.name.namespace",
        ],
        settings: { foreground: ramp.type },
      },

      {
        scope: ["string", "string.quoted", "string.template", "constant.character.escape"],
        settings: { foreground: ramp.string },
      },

      {
        scope: [
          "constant.numeric",
          "constant.language",
          "constant.other",
          "support.constant",
          "entity.other.attribute-name",
        ],
        settings: { foreground: ramp.number },
      },

      {
        scope: ["variable", "variable.other", "meta.object-literal.key", "support.variable"],
        settings: { foreground: ramp.plain },
      },

      {
        scope: ["punctuation", "meta.brace", "keyword.operator"],
        settings: { foreground: ramp.punctuation },
      },

      /*
       * Diffs are the one place where hue would be load-bearing, and also the
       * one place a glyph is guaranteed — a diff line carries its own `+`/`-`
       * in the source — so the pair is safe to colour.
       */
      {
        scope: ["markup.inserted", "meta.diff.header.to-file"],
        settings: { foreground: ramp.string },
      },
      {
        scope: ["markup.deleted", "meta.diff.header.from-file"],
        settings: { foreground: ramp.deleted },
      },
      {
        scope: ["markup.bold"],
        settings: { foreground: ramp.plain, fontStyle: "bold" },
      },
      {
        scope: ["markup.italic"],
        settings: { foreground: ramp.plain, fontStyle: "italic" },
      },
      {
        scope: ["markup.heading", "entity.name.section"],
        settings: { foreground: ramp.keyword, fontStyle: "bold" },
      },
    ],
  } satisfies ThemeRegistrationRaw
}

export const joinuiLight = buildTheme("joinui-light", "light", LIGHT)
export const joinuiDark = buildTheme("joinui-dark", "dark", DARK)
