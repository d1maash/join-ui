import type { ThemeRegistrationRaw } from "shiki"

/**
 * Syntax themes.
 *
 * Off-the-shelf Shiki themes are tuned for an editor at full saturation, which
 * on a documentation page reads as noise sitting inside otherwise quiet type —
 * and next to a chrome with no hue in it at all, it reads as a different site.
 * These two hold the grammar at roughly a third of an editor theme's chroma,
 * over the same neutral base as everything else: warm paper in the light
 * theme, charcoal in the dark one.
 *
 * Six roles carry the whole grammar, and each keeps its hue across both themes
 * so a reader who learns the mapping once keeps it:
 *   keyword   — muted violet; control flow and declarations
 *   entity    — muted blue; functions and the things being called
 *   type      — muted teal; types, classes and JSX tags
 *   string    — muted green; strings and template literals
 *   number    — muted amber; numeric and language constants, JSX attributes
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
  plain: "#3c3733",
  keyword: "#6a5aa6",
  entity: "#3c6a94",
  type: "#2f7068",
  string: "#4a7551",
  number: "#96632c",
  comment: "#79726b",
  punctuation: "#7a736c",
  deleted: "#9d5057",
  background: "transparent",
}

const DARK: Ramp = {
  plain: "#d6d1cb",
  keyword: "#b3a6dc",
  entity: "#93b4d4",
  type: "#82c4bb",
  string: "#a2c49f",
  number: "#d6ab7b",
  comment: "#8b837b",
  punctuation: "#9c948b",
  deleted: "#d9989a",
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

export const joinuiLight = buildTheme("joinui-light", "light", LIGHT)
export const joinuiDark = buildTheme("joinui-dark", "dark", DARK)
