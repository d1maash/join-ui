/*
 * The anatomy of every plate: which parts get a letter, what the letter says,
 * and where on the live component its leader line lands.
 *
 * `at.sel` is a selector inside the plate's stage; `x` and `y` are where on
 * that element's box the line ends (0–1 on each axis). Without a selector the
 * point is taken on the stage itself. `box` draws a dashed outline around the
 * element while its callout is the active one. A list of anchors is tried in
 * order — the first that finds a visible element wins — for parts that come
 * and go as the component runs (a console that only exists while a step is
 * open, buttons that leave once a request is answered).
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
  at: CalloutAnchor | CalloutAnchor[]
}

export interface Anatomy {
  layout: "side" | "split" | "below"
  callouts: Callout[]
  /** Where in the scene the legend is set on wide screens, if anywhere. */
  legendSlot?: string
}

export const ANATOMY: Record<string, Anatomy> = {
  "agent-hive": {
    layout: "split",
    callouts: [
      {
        key: "A",
        side: "left",
        title: "Rail",
        note: "A pip rides above the comb and slides to the column of the pick.",
        spec: "rail",
        at: { sel: 'div:has(+ [role="radiogroup"])', x: 0.02, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "B",
        side: "left",
        title: "The comb",
        note: "A radio group drawn as glass tiles. Arrow keys walk it; disabled tiles are skipped.",
        spec: 'role="radiogroup"',
        at: { sel: '[role="radiogroup"]', x: 0.02, y: 0.6 },
      },
      {
        key: "C",
        side: "left",
        title: "Travelling tint",
        note: "One tinted tile slides to whatever is picked, in that model's accent.",
        spec: "accent: oklch(…)",
        at: { sel: '[role="radio"][aria-checked="true"]', x: 0.5, y: 0.5, box: true, pad: 3 },
      },
      {
        key: "D",
        side: "right",
        title: "Action",
        note: "Fires onGenerate with the picked model. Busy and disabled are props, not guesses.",
        spec: "onGenerate(model)",
        at: { sel: "button:not([role])", x: 0.96, y: 0.5, box: true, pad: 5 },
      },
      {
        key: "E",
        side: "right",
        title: "Run queue",
        note: "Each prompt types itself in, then settles on done or failed. A polite live region.",
        spec: "runs · maxRuns={3}",
        at: { sel: "ol > li", x: 0.98, y: 0.5, box: true, pad: 4 },
      },
    ],
  },

  "approval-gate": {
    layout: "below",
    legendSlot: "[data-legend-slot]",
    callouts: [
      {
        key: "A",
        title: "Countdown ring",
        note: "Thirty seconds, held while the pointer or focus is on the card.",
        spec: "timeout={30_000}",
        at: { sel: "[data-live] [role=group] > div > span:first-child", x: 0.5, y: 0.5 },
      },
      {
        key: "B",
        title: "Risk capsule",
        note: "Destructive, Caution or Awaiting — and the outcome, once answered.",
        spec: 'risk="high"',
        at: { sel: "[data-live] [role=group] p + span", x: 0.5, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "C",
        title: "Command",
        note: "A line per entry, the prompt glyph kept out of the selection. Struck through on deny.",
        spec: "command · prefix",
        at: { sel: "[data-live] .rounded-soft", x: 0.6, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "D",
        title: "Answer keys",
        note: "Y allows, N or Esc denies — only while focus is inside, so the page keeps its keys.",
        spec: 'hotkeys="focus"',
        at: [
          { sel: "[data-live] .ml-auto", x: 0.5, y: 0.5, box: true, pad: 4 },
          { sel: "[data-live] [role=group]", x: 0.85, y: 0.82 },
        ],
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
        at: { sel: "p > span:first-child", x: 0.02, y: 0.55 },
      },
      {
        key: "B",
        title: "The copy",
        note: "Starts on top of the line above, identical, and travels down one line to seat.",
        spec: "timing.copy = 800",
        at: { sel: "p > span:nth-child(2)", x: 0.7, y: 0.55 },
      },
      {
        key: "C",
        title: "Windows",
        note: "Only the words that differ turn over, like a counter. The rest never move.",
        spec: "timing.roll = 550",
        at: { sel: "p > span:nth-child(2) > span:first-child", x: 0.5, y: 0.5, box: true, pad: 4 },
      },
    ],
  },

  "focus-stack": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "The pill in focus",
        note: "Full size, sharp, upright — the one item the reader is meant to see.",
        spec: "index · onIndexChange",
        at: { sel: "button[aria-current]", x: 0.98, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "B",
        title: "Badge",
        note: "Each item's glyph, in its own accent.",
        spec: "icon · accent",
        at: { sel: "button[aria-current] > span:nth-child(2)", x: 0.5, y: 0.5 },
      },
      {
        key: "C",
        title: "The coil",
        note: "Neighbours twist away by depth and soften, so the list still reads as a list.",
        spec: "depth={2} · tilt · blur",
        at: { sel: "ol > li:first-child button", x: 0.86, y: 0.6 },
      },
      {
        key: "D",
        title: "Timer, or the page",
        note: "Turned every 2.6 s here. mode=\"scroll\" ties it to the page instead.",
        spec: 'mode="auto" · interval={2600}',
        at: { sel: "ol > li:last-child button", x: 0.84, y: 0.4 },
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
        at: { sel: "ul", x: 0.5, y: 0.02, box: true, pad: 6 },
      },
      {
        key: "B",
        title: "Glass discs",
        note: "Tinted with each mark's accent. The arc swings with the pointer and springs home.",
        spec: "marks[] · parallax · drag",
        at: { sel: "ul > li:last-child", x: 0.6, y: 0.4 },
      },
      {
        key: "C",
        title: "Headline, in two voices",
        note: "CrestQuiet drops part of the line back, so one sentence carries two weights.",
        spec: "<CrestQuiet>",
        at: { sel: "h3", x: 0.97, y: 0.3, box: true, pad: 6 },
      },
      {
        key: "D",
        title: "Action",
        note: "A link or a button, set under the copy.",
        spec: "<CrestAction>",
        at: [
          { sel: "section a", x: 0.96, y: 0.5, box: true, pad: 4 },
          { sel: "section button", x: 0.96, y: 0.5, box: true, pad: 4 },
        ],
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
        at: { sel: ".font-sans > div:first-child > span:last-child", x: 0.98, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "B",
        title: "Timestamp",
        note: "Optional, set right, in tabular figures.",
        spec: "timestamp",
        at: { sel: "ol > li:first-child > div:last-child > span", x: 0.96, y: 0.5, box: true, pad: 3 },
      },
      {
        key: "C",
        title: "Connector",
        note: "Runs down to the next marker a tenth of a second after the cleared one turns.",
        spec: "transform · opacity",
        at: { sel: "ol > li:first-child > div:first-child > span:last-child", x: 0.5, y: 0.5 },
      },
      {
        key: "D",
        title: "The step in flight",
        note: "Carries aria-current. On arrival two rings spread out of its marker, once.",
        spec: 'aria-current="step"',
        at: [
          { sel: 'ol > li[aria-current="step"]', x: 0.99, y: 0.3, box: true, pad: 5 },
          { sel: "ol > li:last-child", x: 0.99, y: 0.3, box: true, pad: 5 },
        ],
      },
      {
        key: "E",
        title: "Upcoming",
        note: "A quiet grey disc, and a hidden “Not started”. Colour never carries it alone.",
        spec: 'state: "upcoming"',
        at: { sel: "ol > li:last-child > div:first-child > span:first-child", x: 0.5, y: 0.5 },
      },
    ],
  },

  "tool-trace": {
    layout: "side",
    callouts: [
      {
        key: "A",
        title: "Run header",
        note: "The trace's name and a status chip. The list is named by it for screen readers.",
        spec: "label · status",
        at: { sel: ".font-sans > div:first-child > span:last-child", x: 0.98, y: 0.5, box: true, pad: 4 },
      },
      {
        key: "B",
        title: "State tile and rail",
        note: "Pending, running, done, failed, skipped — each a glyph and a hidden word.",
        spec: 'state: "running"',
        at: [
          { sel: "ol > li[aria-current] > div:first-child > span:first-child", x: 0.5, y: 0.5, box: true, pad: 4 },
          { sel: "ol > li:first-child > div:first-child > span:first-child", x: 0.5, y: 0.5, box: true, pad: 4 },
        ],
      },
      {
        key: "C",
        title: "Console",
        note: "The step in flight opens itself and writes its output a line at a time.",
        spec: "stream · lineSpeed={150}",
        at: [
          { sel: '[role="region"] .rounded-soft', x: 0.99, y: 0.5, box: true, pad: 3 },
          { sel: "ol > li:first-child button", x: 0.9, y: 0.5 },
        ],
      },
      {
        key: "D",
        title: "Step",
        note: "The tool's name in mono, its argument under it. Enter opens it and pins it open.",
        spec: "name · summary",
        at: { sel: "ol > li:last-child button > span:first-child", x: 0.42, y: 0.3 },
      },
      {
        key: "E",
        title: "Footer",
        note: "Anything you pass. Here, how far through the run is.",
        spec: "footer",
        at: { sel: ".font-sans > div:last-child > div > span:last-child", x: 0.98, y: 0.5, box: true, pad: 6 },
      },
    ],
  },
}
