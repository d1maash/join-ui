import type { ThemeRegistrationRaw } from "shiki"

/**
 * Achromatic syntax themes.
 *
 * Every off-the-shelf Shiki theme is built around hue, which would be the one
 * place colour leaked back into the interface. These two themes encode the
 * same information with the only channels the design system allows: luminance,
 * weight and italics.
 *
 * The ramp mirrors the greys in `globals.css`:
 *   ink      — keywords and punctuation that structure the line
 *   strong   — identifiers the reader scans for (functions, types, tags)
 *   body     — plain code
 *   quiet    — strings and literals, set lighter so they read as data
 *   faint    — comments, italic and lightest of all
 */
interface Ramp {
  ink: string
  strong: string
  body: string
  quiet: string
  faint: string
  background: string
}

const LIGHT: Ramp = {
  ink: "#000000",
  strong: "#1f1f1f",
  body: "#3a3a3a",
  quiet: "#5c5c5c",
  faint: "#8f8f8f",
  background: "#ffffff",
}

const DARK: Ramp = {
  ink: "#ffffff",
  strong: "#e6e6e6",
  body: "#c4c4c4",
  quiet: "#9c9c9c",
  faint: "#6e6e6e",
  background: "#000000",
}

function buildTheme(name: string, type: "light" | "dark", ramp: Ramp) {
  return {
    name,
    type,
    colors: {
      "editor.background": ramp.background,
      "editor.foreground": ramp.body,
    },
    settings: [
      { settings: { foreground: ramp.body, background: ramp.background } },

      {
        scope: ["comment", "punctuation.definition.comment", "string.comment"],
        settings: { foreground: ramp.faint, fontStyle: "italic" },
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
          "constant.language",
        ],
        settings: { foreground: ramp.ink, fontStyle: "bold" },
      },

      {
        scope: [
          "entity.name.function",
          "support.function",
          "meta.function-call.generic",
          "entity.name.type",
          "entity.name.class",
          "support.class",
          "support.type",
          "entity.name.tag",
          "entity.other.attribute-name",
        ],
        settings: { foreground: ramp.strong, fontStyle: "bold" },
      },

      {
        scope: [
          "string",
          "string.quoted",
          "string.template",
          "constant.numeric",
          "constant.character",
          "constant.other",
          "support.constant",
        ],
        settings: { foreground: ramp.quiet },
      },

      {
        scope: ["variable", "variable.other", "meta.object-literal.key", "support.variable"],
        settings: { foreground: ramp.body },
      },

      {
        scope: ["punctuation", "meta.brace", "keyword.operator"],
        settings: { foreground: ramp.faint },
      },

      {
        scope: ["markup.inserted", "meta.diff.header.to-file"],
        settings: { foreground: ramp.ink, fontStyle: "bold" },
      },
      {
        scope: ["markup.deleted", "meta.diff.header.from-file"],
        settings: { foreground: ramp.faint, fontStyle: "italic" },
      },
      {
        scope: ["markup.bold"],
        settings: { foreground: ramp.ink, fontStyle: "bold" },
      },
      {
        scope: ["markup.italic"],
        settings: { foreground: ramp.body, fontStyle: "italic" },
      },
      {
        scope: ["markup.heading", "entity.name.section"],
        settings: { foreground: ramp.ink, fontStyle: "bold" },
      },
    ],
  } satisfies ThemeRegistrationRaw
}

export const swissLight = buildTheme("swiss-light", "light", LIGHT)
export const swissDark = buildTheme("swiss-dark", "dark", DARK)
