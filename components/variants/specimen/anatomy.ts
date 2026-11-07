/*
 * The anatomy of every plate: which parts get a letter, what the letter says,
 * and where on the live component its leader line lands.
 *
 * `at.sel` is a selector inside the plate's stage; `x` and `y` are where on
 * that element's box the line ends (0–1 on each axis). Without a selector the
 * point is taken on the stage itself. `box` draws a dashed outline around the
 * element while its callout is the active one.
 */

export interface CalloutAnchor {
  sel?: string
  x?: number
  y?: number
  box?: boolean
  pad?: number
}

export interface Callout {
  key: string
  title: string
  note?: string
  spec?: string
  side?: "left" | "right"
  at: CalloutAnchor
}

export interface Anatomy {
  layout: "side" | "split" | "below"
  callouts: Callout[]
}

export const ANATOMY: Record<string, Anatomy> = {
  "agent-hive": {
    layout: "split",
    callouts: [
      {
        key: "A",
        side: "left",
        title: "The comb",
        note: "A radio group drawn as glass tiles. Arrow keys walk it, disabled tiles are skipped.",
        spec: 'role="radiogroup"',
        at: { sel: '[role="radiogroup"]', x: 0.08, y: 0.5, box: true },
      },
      {
        key: "B",
        side: "left",
        title: "Travelling tint",
        note: "One tinted tile slides to whatever is picked, in the model's own accent.",
        spec: "accent: oklch(…)",
        at: { sel: '[role="radio"][aria-checked="true"]', x: 0.5, y: 0.5, box: true },
      },
      {
        key: "C",
        side: "right",
        title: "Action",
        note: "Fires onGenerate with the picked model. Busy and disabled are props, not guesses.",
        spec: "onGenerate(model)",
        at: { sel: "button:not([role])", x: 0.9, y: 0.5, box: true },
      },
      {
        key: "D",
        side: "right",
        title: "Run queue",
        note: "Each dispatched prompt types itself in, then settles on done or failed.",
        spec: "runs · maxRuns={3}",
        at: { sel: "li", x: 0.96, y: 0.5, box: true },
      },
    ],
  },

  "approval-gate": {
    layout: "below",
    callouts: [
      {
        key: "A",
        title: "Countdown ring",
        note: "Thirty seconds, and it holds while the pointer or focus is on the card.",
        spec: "timeout={30_000}",
        at: { sel: "[data-live] [role=group] > div > span:first-child", x: 0.5, y: 0.5 },
      },
      {
        key: "B",
        title: "Risk capsule",
        note: "Destructive, Caution or Awaiting. Turns into the outcome once answered.",
        spec: 'risk="high"',
        at: { sel: "[data-live] [role=group] p + span", x: 0.5, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "C",
        title: "Command",
        note: "One line per entry, prompt glyph kept out of the selection. Struck through on deny.",
        spec: "command · prefix",
        at: { sel: "[data-live] [role=group] pre, [data-live] [role=group] code", x: 0.62, y: 0.5, box: true },
      },
      {
        key: "D",
        title: "Answer keys",
        note: "Y allows, N or Esc denies — only while focus is inside, so the page keeps its keys.",
        spec: 'hotkeys="focus"',
        at: { sel: "[data-live] [role=group] button:last-of-type", x: 0.5, y: 0.5, box: true, pad: 4 },
      },
    ],
  },

  "carbon-copy": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "The first line inks",
        note: "Weight rises from 100 to 600 on a variable face, so the words fill rather than appear.",
        spec: "timing.ink = 1100",
        at: { sel: "p > span:first-child", x: 0.04, y: 0.5 },
      },
      {
        key: "B",
        title: "The copy",
        note: "Starts on top of the line above, identical, and travels down one line to seat.",
        spec: "timing.copy = 800",
        at: { sel: "p > span:nth-child(2)", x: 0.2, y: 0.55 },
      },
      {
        key: "C",
        title: "Windows",
        note: "Only the words that differ turn over, like a counter. The rest never move.",
        spec: "timing.roll = 550",
        at: { sel: "p > span:nth-child(2)", x: 0.86, y: 0.5 },
      },
    ],
  },

  "focus-stack": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "The pill in focus",
        note: "Full size, sharp, upright. The one item the reader is meant to see.",
        spec: "index · onIndexChange",
        at: { sel: "li[aria-current], li[data-active], [aria-current]", x: 0.92, y: 0.5, box: true },
      },
      {
        key: "B",
        title: "The coil",
        note: "Neighbours twist away by depth and soften, so the list still reads as a list.",
        spec: "depth={2} · tilt · blur",
        at: { sel: "li:first-child", x: 0.75, y: 0.5 },
      },
      {
        key: "C",
        title: "Badge",
        note: "Each item's glyph, tinted in its own accent.",
        spec: "icon · accent",
        at: { sel: "li[aria-current] svg, [aria-current] svg", x: 0.5, y: 0.5 },
      },
      {
        key: "D",
        title: "Timer or scroll",
        note: "Turned every 2.6 s here; mode=\"scroll\" ties it to the page instead.",
        spec: 'mode="auto" · interval={2600}',
        at: { sel: "li:last-child", x: 0.7, y: 0.5 },
      },
    ],
  },

  "glass-crest": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "The arc",
        note: "Solved from a count and a spread. It assembles from its apex on mount, then holds.",
        spec: "spread · overlap",
        at: { x: 0.5, y: 0.2 },
      },
      {
        key: "B",
        title: "Glass discs",
        note: "Tinted with each mark's accent; the arc swings with the pointer and springs home.",
        spec: "marks[] · parallax · drag",
        at: { x: 0.36, y: 0.28 },
      },
      {
        key: "C",
        title: "Headline, with a quieter voice",
        note: "CrestQuiet drops part of the line back, so one sentence carries two weights.",
        spec: "<CrestQuiet>",
        at: { sel: "h3", x: 0.85, y: 0.3, box: true },
      },
      {
        key: "D",
        title: "Action",
        note: "A link or a button, set under the copy.",
        spec: "<CrestAction>",
        at: { sel: "a, button", x: 0.5, y: 0.5, box: true },
      },
    ],
  },

  "status-timeline": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "Header and status",
        note: "Names the list for assistive technology and says where the run stands.",
        spec: "label · status",
        at: { sel: "header, div:first-child", x: 0.85, y: 0.5 },
      },
      {
        key: "B",
        title: "Cleared step",
        note: "A tick on green, never colour alone: the hidden label reads “Completed”.",
        spec: 'state: "complete"',
        at: { sel: "ol > li:first-child", x: 0.04, y: 0.25 },
      },
      {
        key: "C",
        title: "The step in flight",
        note: "Carries aria-current. On arrival two rings spread out of its marker, once.",
        spec: 'aria-current="step"',
        at: { sel: 'ol > li[aria-current="step"]', x: 0.04, y: 0.25, box: true },
      },
      {
        key: "D",
        title: "Connector",
        note: "Runs down to the next marker a tenth of a second after the cleared one turns.",
        spec: "transform · opacity",
        at: { sel: "ol > li:nth-child(2)", x: 0.04, y: 0.8 },
      },
      {
        key: "E",
        title: "Timestamp",
        note: "Optional, right-aligned, tabular figures.",
        spec: "timestamp",
        at: { sel: "ol > li:first-child", x: 0.96, y: 0.25 },
      },
    ],
  },

  "tool-trace": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "Run header",
        note: "The trace's name and a status chip. Named for assistive technology through it.",
        spec: "label · status",
        at: { x: 0.85, y: 0.08 },
      },
      {
        key: "B",
        title: "State tile and rail",
        note: "Pending, running, done, failed, skipped — each a glyph and a hidden word.",
        spec: 'state: "running"',
        at: { x: 0.1, y: 0.3 },
      },
      {
        key: "C",
        title: "Console",
        note: "The step in flight opens itself and writes its output a line at a time.",
        spec: "stream · lineSpeed={150}",
        at: { sel: '[role="region"]', x: 0.92, y: 0.5, box: true },
      },
      {
        key: "D",
        title: "Duration",
        note: "Only once a step resolves. A time on a step that has not run would be a lie.",
        spec: "meta",
        at: { x: 0.9, y: 0.22 },
      },
      {
        key: "E",
        title: "Footer",
        note: "Anything you pass. Here, how far through the run is.",
        spec: "footer",
        at: { x: 0.8, y: 0.94 },
      },
    ],
  },
}
