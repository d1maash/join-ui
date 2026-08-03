import type { ThemeRegistrationRaw } from "shiki"

/**
 * Syntax themes.
 *
 * Off-the-shelf Shiki themes are tuned for an editor at full saturation, which
 * on a documentation page reads as noise sitting inside otherwise quiet type.
 * These two hold the same information at roughly half that chroma, over the
 * same neutral base the rest of the site uses: warm paper in the light theme,
 * slate in the dark one.
 *
 * Six roles carry the whole grammar, and each keeps its hue across both themes
 * so a reader who learns the mapping once keeps it:
 *   keyword   — violet, the brand hue; control flow and declarations
 *   entity    — blue; functions and the things being called
 *   type      — teal; types, classes and JSX tags
 *   string    — green; strings and template literals
 *   number    — amber; numeric and language constants, JSX attributes
 *   comment   — neutral and italic, the quietest thing on the line
 *
 * Every value clears 4.5:1 against its own theme's code background, so the
 * grammar stays legible for anyone reading the page in greyscale.
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
  plain: "#413b36",
  keyword: "#6644c8",
  entity: "#2a6ba8",
  type: "#146b62",
  string: "#3d7a4a",
  number: "#a05a1f",
  comment: "#7d756e",
  punctuation: "#6b645e",
  deleted: "#a8455a",
  background: "transparent",
}

const DARK: Ramp = {
  plain: "#d7d5e2",
  keyword: "#b6a0ff",
  entity: "#86b6f0",
  type: "#6fd0c4",
  string: "#94d3a2",
  number: "#f0b27a",
  comment: "#847f97",
  punctuation: "#9a95ab",
  deleted: "#f2879d",
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
        settings: { foreground: ramp.keyword },
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

export const joinwayLight = buildTheme("joinway-light", "light", LIGHT)
export const joinwayDark = buildTheme("joinway-dark", "dark", DARK)
