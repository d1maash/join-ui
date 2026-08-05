import { defineComponent, uiFile } from "@/lib/registry/define"
import type { ComponentMetadata } from "@/types/registry"

/**
 * The single source of truth for the whole site.
 *
 * Catalog cards, component pages, docs navigation, the search index, install
 * commands, `/r/*.json` registry items, AI prompts and related-component links
 * are all projected from this array. Add a component here and it appears
 * everywhere; nothing below is repeated anywhere else in the codebase.
 *
 * To add one:
 *   1. Write the component at `registry/components/<slug>.tsx`.
 *   2. Register a demo for `<slug>` in `components/previews/registry.tsx`.
 *   3. Append a `defineComponent({ … })` record here.
 *   4. Run `pnpm registry:build` to emit `registry.json` and `public/r/*.json`.
 *
 * `defineComponent` and `uiFile` from `@/lib/registry/define` derive the
 * install command and the file descriptor, so neither is written by hand.
 */
export const components: ComponentMetadata[] = [
  defineComponent({
    name: "StatusTimeline",
    slug: "status-timeline",
    title: "Status Timeline",
    description:
      "A colour-coded step tracker for orders, deployments and onboarding, still at rest and animated only when a step advances.",
    overview:
      "StatusTimeline renders a fixed sequence of steps and marks where the process currently stands. Pass an activeStep index and it derives the rest — earlier steps turn green, the one in flight turns blue, the rest stay grey behind a dashed ring — or pin a state per step to describe a run that is waiting on someone or has failed outright. At rest it is a still drawing: nothing loops and nothing breathes. The motion is spent on the one moment worth showing — move activeStep on and the connector above the cleared step draws downward, the marker it reaches cross-fades into its new ring, and a single pulse leaves the step now in flight. It lays out vertically as a tracking card or horizontally as a wizard header, and every hue is backed by a glyph and a text label, so the state never rests on colour alone.",
    category: "Data Display",
    tags: [
      "timeline",
      "stepper",
      "progress",
      "status",
      "order",
      "tracker",
      "steps",
      "delivery",
    ],
    status: "new",
    featured: true,
    dependencies: ["motion", "lucide-react"],
    registryDependencies: ["utils"],
    files: [uiFile("status-timeline")],
    accessibility: [
      "Steps render as an ordered list, so assistive technology reports both position and total.",
      'The step in flight carries `aria-current="step"`.',
      "Colour is never the only signal, which is what satisfies WCAG 1.4.1: every state also has its own glyph — a tick, a pip, a clock, a cross — and appends a visually hidden label reading “Completed”, “In progress”, “Waiting”, “Not started” or “Blocked”.",
      "A blocked step additionally shifts its title to the critical hue, so the failure is findable without reading every marker.",
      "The list is named by the header eyebrow through `aria-labelledby`, or by `label` when the header is hidden.",
      "Markers, trails and the arrival ring are `aria-hidden` and non-interactive; only content you pass to `footer` enters the tab order.",
      "Nothing animates on mount or loops at rest, so the component never competes with the page for attention; the advance transition animates `transform` and `opacity` only, and resolves instantly under `prefers-reduced-motion`.",
      "Both themes are covered by the tokens rather than by `dark:` variants, so the component keeps its contrast inside a forced-theme subtree.",
    ],
    keyboard: [],
    props: [
      {
        name: "StatusTimeline",
        props: [
          {
            name: "steps",
            type: "StatusTimelineStep[]",
            required: true,
            description: "The sequence to render, in order.",
          },
          {
            name: "activeStep",
            type: "number",
            defaultValue: "0",
            description:
              "Index of the step in flight. Earlier steps resolve to complete, later ones to pending. Pass steps.length to complete the whole sequence.",
          },
          {
            name: "orientation",
            type: '"vertical" | "horizontal"',
            defaultValue: '"vertical"',
            description:
              "Vertical stacks the steps as a tracking card; horizontal lays them along a rule as a wizard header.",
          },
          {
            name: "size",
            type: '"sm" | "md"',
            defaultValue: '"md"',
            description: "Marker, type and spacing scale.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Timeline"',
            description:
              "Header eyebrow, and the accessible name of the list when the header is hidden.",
          },
          {
            name: "status",
            type: "string",
            description:
              "Overrides the header chip copy, which is otherwise rolled up from the resolved steps.",
          },
          {
            name: "variant",
            type: '"card" | "plain"',
            defaultValue: '"card"',
            description:
              "Plain drops the surrounding rule, background and padding so the list can sit inside your own container.",
          },
          {
            name: "showHeader",
            type: "boolean",
            defaultValue: "true",
            description: "Renders the eyebrow and status chip above the steps.",
          },
          {
            name: "footer",
            type: "React.ReactNode",
            description:
              "Content placed below a rule — an action, a note, a summary row.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the root element through `cn`.",
          },
        ],
      },
      {
        name: "StatusTimelineStep",
        description: "Shape of a single entry in the `steps` array.",
        props: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Stable identity for the rendered list item.",
          },
          {
            name: "title",
            type: "string",
            required: true,
            description: "Step heading.",
          },
          {
            name: "description",
            type: "string",
            description: "Supporting line below the title.",
          },
          {
            name: "timestamp",
            type: "string",
            description:
              "Trailing meta, set in mono with tabular figures — a time, a duration, an ETA.",
          },
          {
            name: "state",
            type: '"complete" | "current" | "waiting" | "pending" | "blocked"',
            description:
              "Pins the state instead of deriving it from activeStep, and picks the hue: green for complete, blue for current, amber for waiting, grey for pending, red for blocked.",
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description:
              "Replaces the default state glyph inside the marker. Sized by the component, so pass a bare icon element.",
          },
        ],
      },
    ],
    usage: `import { StatusTimeline } from "@/components/joinui/status-timeline"

export function Example() {
  return (
    <StatusTimeline
      label="Delivery"
      activeStep={2}
      steps={[
        { id: "confirmed", title: "Order confirmed", timestamp: "17 Nov, 13:45" },
        { id: "packed", title: "Packed", timestamp: "17 Nov, 16:02" },
        { id: "transit", title: "In transit", timestamp: "18 Nov, 08:20" },
        { id: "delivered", title: "Delivered" },
      ]}
    />
  )
}`,
    customization: [
      {
        title: "A horizontal wizard header",
        description:
          "Drop the descriptions and switch orientation to get a checkout stepper that spans its container.",
        code: `<StatusTimeline
  label="Checkout"
  orientation="horizontal"
  size="sm"
  activeStep={1}
  steps={[
    { id: "cart", title: "Cart" },
    { id: "address", title: "Address" },
    { id: "payment", title: "Payment" },
    { id: "review", title: "Review" },
  ]}
/>`,
      },
      {
        title: "Pin a step that failed, or one that is waiting",
        description:
          "A state on the step wins over the one derived from activeStep, so a run that stalled can be described exactly. Blocked turns the marker and the title red; waiting turns the marker amber for something that is neither moving nor broken, like an approval sitting in a queue. Either way the header chip picks the state up on its own.",
        code: `<StatusTimeline
  label="Pipeline"
  steps={[
    { id: "install", title: "Install", timestamp: "12s", state: "complete" },
    { id: "typecheck", title: "Typecheck", timestamp: "31s", state: "complete" },
    {
      id: "test",
      title: "Test",
      description: "4 of 212 assertions failed.",
      state: "blocked",
    },
    { id: "deploy", title: "Deploy", state: "pending" },
  ]}
/>

<StatusTimeline
  label="Onboarding"
  steps={[
    { id: "account", title: "Account created", state: "complete" },
    {
      id: "review",
      title: "Identity review",
      description: "Usually clears within an hour.",
      state: "waiting",
    },
    { id: "invite", title: "Invite your team", state: "pending" },
  ]}
/>`,
      },
      {
        title: "Give each step its own glyph",
        description:
          "An icon replaces the default state glyph while the ring and the hidden state label keep carrying the meaning — a dashed grey circle before the step happens, a tinted one after. The component sizes it, so pass the element bare.",
        code: `import { MapPin, Package, ShoppingBag, Truck } from "lucide-react"

<StatusTimeline
  activeStep={2}
  steps={[
    { id: "confirmed", title: "Order confirmed", icon: <ShoppingBag /> },
    { id: "packed", title: "Packed", icon: <Package /> },
    { id: "transit", title: "In transit", icon: <Truck /> },
    { id: "delivered", title: "Delivered", icon: <MapPin /> },
  ]}
/>`,
      },
      {
        title: "Sit inside your own container",
        description:
          "The plain variant removes the rule, background and padding, and the header can go with it — useful inside a drawer or an existing card.",
        code: `<div className="rounded-soft-lg border border-border p-6">
  <h3 className="mb-4 text-sm font-medium">Onboarding</h3>
  <StatusTimeline
    variant="plain"
    showHeader={false}
    label="Onboarding"
    size="sm"
    activeStep={1}
    steps={steps}
  />
</div>`,
      },
      {
        title: "Add an action below the steps",
        description:
          "Anything passed to footer renders below a rule. It is the only part of the component that can take focus, so it is where a call to action belongs.",
        code: `<StatusTimeline
  label="Delivery"
  activeStep={steps.length}
  steps={steps}
  footer={
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-positive-soft px-3 py-1.5 text-xs font-medium text-positive"
    >
      <Star aria-hidden="true" className="size-3.5" />
      Rate this delivery
    </button>
  }
/>`,
      },
      {
        title: "Retint the states",
        description:
          "The states read the component palette rather than literal colours, so a brand hue is a token override — no props to thread and no variants to add. Redeclare a family in both themes and every step, chip and trail follows.",
        language: "css",
        code: `/* app/globals.css */
:root,
.light {
  /* A violet in-flight state instead of the default blue. */
  --info: oklch(0.5 0.19 292);
  --info-soft: oklch(0.965 0.025 292);
  --info-foreground: oklch(0.99 0.005 292);
}

.dark {
  --info: oklch(0.76 0.15 292);
  --info-soft: oklch(0.255 0.06 292);
  --info-foreground: oklch(0.16 0.04 292);
}`,
      },
    ],
    /**
     * Shipped with the registry item so `shadcn add` writes the palette into the
     * consumer's `globals.css`. Both themes are declared, which is what lets the
     * component avoid `dark:` variants entirely.
     */
    cssVars: {
      theme: {
        "color-info": "var(--info)",
        "color-info-soft": "var(--info-soft)",
        "color-info-foreground": "var(--info-foreground)",
        "color-positive": "var(--positive)",
        "color-positive-soft": "var(--positive-soft)",
        "color-positive-foreground": "var(--positive-foreground)",
        "color-caution": "var(--caution)",
        "color-caution-soft": "var(--caution-soft)",
        "color-caution-foreground": "var(--caution-foreground)",
        "color-critical": "var(--critical)",
        "color-critical-soft": "var(--critical-soft)",
        "color-critical-foreground": "var(--critical-foreground)",
        "radius-soft-sm": "0.375rem",
        "radius-soft": "0.625rem",
        "radius-soft-lg": "1rem",
      },
      light: {
        info: "oklch(0.5 0.17 253)",
        "info-soft": "oklch(0.965 0.022 253)",
        "info-foreground": "oklch(0.99 0.005 253)",
        positive: "oklch(0.5 0.13 158)",
        "positive-soft": "oklch(0.965 0.03 158)",
        "positive-foreground": "oklch(0.99 0.008 158)",
        caution: "oklch(0.53 0.13 68)",
        "caution-soft": "oklch(0.965 0.04 78)",
        "caution-foreground": "oklch(0.99 0.008 68)",
        critical: "oklch(0.52 0.19 23)",
        "critical-soft": "oklch(0.965 0.025 23)",
        "critical-foreground": "oklch(0.99 0.006 23)",
      },
      dark: {
        info: "oklch(0.76 0.14 253)",
        "info-soft": "oklch(0.255 0.058 253)",
        "info-foreground": "oklch(0.16 0.04 253)",
        positive: "oklch(0.78 0.14 158)",
        "positive-soft": "oklch(0.25 0.05 158)",
        "positive-foreground": "oklch(0.16 0.035 158)",
        caution: "oklch(0.82 0.14 80)",
        "caution-soft": "oklch(0.26 0.05 68)",
        "caution-foreground": "oklch(0.17 0.035 68)",
        critical: "oklch(0.72 0.17 23)",
        "critical-soft": "oklch(0.26 0.07 23)",
        "critical-foreground": "oklch(0.16 0.04 23)",
      },
    },
    related: [],
    since: "2026-08-02",
  }),

  defineComponent({
    name: "FocusStack",
    slug: "focus-stack",
    title: "Focus Stack",
    description:
      "A coil of pills that keeps one item in focus and lets the rest twist away, turned either by a timer or by the page scroll.",
    overview:
      "FocusStack draws a list as a receding stack: rank by rank the pills shrink, fade, blur and lean away from the middle, and the one in focus straightens out, comes back to full size and lifts off the page. Every one of those properties is a function of a single fractional number — the distance from a pill to the focused position — so nothing snaps between states and two pills can sit half-focused either side of the centre mid-turn. That number has two drivers, and they are the two variants. In auto mode a spring walks it along on a timer, the stack wraps end to end, and a pill can be clicked or arrowed into focus; the timer stops for a pointer, for a caret, for a stack scrolled out of view and for anyone who has asked for reduced motion. In scroll mode the number is mapped to the stack's own transit through the viewport instead, so the coil turns exactly as far as the reader scrolls it and nothing moves on its own.",
    category: "Data Display",
    tags: [
      "carousel",
      "stack",
      "scroll",
      "showcase",
      "features",
      "list",
      "slider",
      "parallax",
    ],
    status: "new",
    featured: true,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("focus-stack")],
    accessibility: [
      "The pills render as an ordered list, so assistive technology reports both position and total, and the list is named by `label`.",
      'The pill in focus carries `aria-current="true"` in both modes.',
      "Depth is never the only signal: scale, opacity and blur are decoration over text that stays in the accessibility tree at full strength, so a screen reader gets the whole list rather than the three ranks that happen to be legible.",
      "In auto mode the stack is a single tab stop with a roving tabindex, and the arrow keys move inside it — tabbing past a seven-item carousel does not cost seven stops.",
      "WCAG 2.2.2 wants a mechanism to pause anything that moves by itself for more than five seconds. Autoplay stops on hover and on focus within, stops while the stack is scrolled out of view, and the `paused` prop hands the same switch to a control you own.",
      "`prefers-reduced-motion` disables autoplay outright and drops the springs, so the stack becomes a still drawing that only moves when it is clicked, arrowed or scrolled.",
      "Scroll mode adds no animation of its own: the position is tied to the scrollbar, so nothing plays that the reader did not drive.",
      "A pill faded past the edge of the stack has its pointer events removed, so an invisible target can never take a click.",
      "Badges are `aria-hidden`; the label carries the meaning, which is what keeps a pale accent from becoming an accessibility problem.",
      "Both themes are covered by the tokens rather than by `dark:` variants, so the component keeps its contrast inside a forced-theme subtree.",
    ],
    keyboard: [
      {
        keys: ["↑", "←"],
        description: "Moves the focus one pill up the stack.",
      },
      {
        keys: ["↓", "→"],
        description: "Moves the focus one pill down the stack.",
      },
      { keys: ["Home"], description: "Focuses the first pill." },
      { keys: ["End"], description: "Focuses the last pill." },
      {
        keys: ["Enter", "Space"],
        description: "Brings the pill under the caret into focus.",
      },
    ],
    props: [
      {
        name: "FocusStack",
        props: [
          {
            name: "items",
            type: "FocusStackItem[]",
            required: true,
            description: "The pills to render, in order.",
          },
          {
            name: "mode",
            type: '"auto" | "scroll"',
            defaultValue: '"auto"',
            description:
              "Auto advances on a timer and takes clicks and arrow keys. Scroll hands the focus to the page, so the coil turns as the stack passes through the viewport.",
          },
          {
            name: "index",
            type: "number",
            description:
              "Controlled focus. Leave unset to let the component hold it, and read the position through onIndexChange instead.",
          },
          {
            name: "defaultIndex",
            type: "number",
            defaultValue: "0",
            description: "Where an uncontrolled stack starts.",
          },
          {
            name: "onIndexChange",
            type: "(index: number) => void",
            description:
              "Fires with the focused index in both modes — in scroll mode once per pill rather than once per frame.",
          },
          {
            name: "interval",
            type: "number",
            defaultValue: "2600",
            description: "Milliseconds between advances in auto mode. Floored at 600.",
          },
          {
            name: "loop",
            type: "boolean",
            description:
              "Wrap past the ends. Defaults to true in auto mode and false in scroll mode. Looping puts the tail of the list above the head, so the depth comes down to fit a short list rather than showing a pill twice.",
          },
          {
            name: "paused",
            type: "boolean",
            defaultValue: "false",
            description:
              "Externally held pause, for a play control of your own. Autoplay also pauses on hover, on focus and off screen without it.",
          },
          {
            name: "depth",
            type: "number",
            defaultValue: "3",
            description:
              "Ranks drawn either side of the focused pill. It also sets the height of the frame, which the component reserves up front so nothing below it shifts.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"md"',
            description: "Pill, badge, type and lane scale.",
          },
          {
            name: "tilt",
            type: "number",
            defaultValue: "5",
            description:
              "Degrees of lean per rank. Both ends twist the same way, so the focused pill is the only level one. Negative twists the coil the other way; 0 stacks it flat.",
          },
          {
            name: "blur",
            type: "number",
            defaultValue: "0.55",
            description:
              "Pixels of blur per rank. Set 0 to drop the filter — and the per-frame repaint with it — on a long list or a weak device.",
          },
          {
            name: "interactive",
            type: "boolean",
            description:
              "Whether a pill can be clicked or arrowed into focus. Defaults to true in auto mode and false in scroll mode, where a click could not hold against the scrollbar.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Highlights"',
            description: "Accessible name of the list.",
          },
          {
            name: "className",
            type: "string",
            description:
              "Merged onto the root through `cn` — this is where the width goes, since the size only sets a max.",
          },
        ],
      },
      {
        name: "FocusStackItem",
        description: "Shape of a single entry in the `items` array.",
        props: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Stable identity for the rendered list item.",
          },
          {
            name: "label",
            type: "string",
            required: true,
            description: "The line of type on the pill.",
          },
          {
            name: "description",
            type: "string",
            description:
              "Second line, revealed only while the pill holds focus. Its space is reserved at every rank, so nothing reflows as the stack turns.",
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description:
              "Drawn inside the badge. Sized by the component, so pass a bare icon element.",
          },
          {
            name: "accent",
            type: "string",
            description:
              "Any CSS colour. Fills the badge; the glyph on top stays near-white. Omit both this and icon and the pill drops the badge entirely.",
          },
        ],
      },
    ],
    usage: `import { FocusStack } from "@/components/joinui/focus-stack"
import { Compass, Layers, Shapes, Sparkles } from "lucide-react"

export function Example() {
  return (
    <FocusStack
      label="Design system"
      items={[
        { id: "language", label: "Design Language", icon: <Compass />, accent: "#6366f1" },
        { id: "direction", label: "Art Direction", icon: <Shapes />, accent: "#f97316" },
        { id: "architecture", label: "UI Architecture", icon: <Layers />, accent: "#a855f7" },
        { id: "motion", label: "Motion System", icon: <Sparkles />, accent: "#ef4444" },
      ]}
    />
  )
}`,
    customization: [
      {
        title: "Turned by the page instead of by a timer",
        description:
          "Scroll mode maps the focus to the stack's own transit through the viewport, so it works wherever it is dropped — no sticky wrapper, no scroll container, no height to calculate. Nothing animates on its own in this mode, which makes it the safer default on a page that already moves.",
        code: `<FocusStack
  mode="scroll"
  label="Capabilities"
  items={items}
  onIndexChange={(index) => setHeadline(items[index].label)}
/>`,
      },
      {
        title: "Drive it yourself",
        description:
          "Pass index and the stack becomes controlled — the spring still takes the shortest way round the ring, so stepping from the last item to the first is one step forward rather than a rewind through everything in between.",
        code: `const [index, setIndex] = React.useState(0)

<FocusStack items={items} index={index} onIndexChange={setIndex} />

<button type="button" onClick={() => setIndex((value) => value + 1)}>
  Next
</button>`,
      },
      {
        title: "A pause control of your own",
        description:
          "Autoplay already stops on hover, on focus and off screen, and never starts under prefers-reduced-motion. The paused prop is for the visible switch WCAG asks for on top of that.",
        code: `const [paused, setPaused] = React.useState(false)

<FocusStack items={items} paused={paused} />

<button type="button" onClick={() => setPaused((value) => !value)}>
  {paused ? "Play" : "Pause"}
</button>`,
      },
      {
        title: "Reshape the coil",
        description:
          "Three numbers own the whole drawing. Depth sets how many ranks survive either side of the focus and how tall the frame is, tilt sets the lean per rank, and blur sets the haze — drop it to 0 on a long list to lose the per-frame repaint.",
        code: `{/* A tight, flat stack for a sidebar. */}
<FocusStack items={items} size="sm" depth={2} tilt={0} blur={0} />

{/* A wide, deep one for a hero, twisted the other way. */}
<FocusStack items={items} size="lg" depth={4} tilt={-7} className="max-w-2xl" />`,
      },
      {
        title: "Retint the badge glyph",
        description:
          "Accents are per item and can be any CSS colour, so the palette belongs to your content rather than to the component. The glyph over them is near-white by default; if your accents are pale, redeclare it once instead of threading a second colour through every item.",
        language: "css",
        code: `/* app/globals.css */
:root {
  --focus-stack-glyph: oklch(0.24 0.02 60);
}`,
      },
    ],
    related: ["status-timeline"],
    since: "2026-08-03",
  }),

  defineComponent({
    name: "AgentHive",
    slug: "agent-hive",
    title: "Agent Hive",
    description:
      "A honeycomb of frosted glass with one tinted tile that travels to whatever you pick, an action, and the queue of runs it dispatches.",
    overview:
      "AgentHive is the console pattern every AI product ends up drawing: choose an engine, send it something, watch the work come back. The comb is glass — frosted hexagons with a lit top edge and a shaded bottom one, over a wash of the selected model's own colour that is masked to the cells, so the light lives inside the material rather than behind it. The selection is not a state each cell paints for itself but a single tinted tile that travels: it stretches along its own direction of movement, its reflection slides to the trailing edge, the cells it passes are shoved aside and drawn back a beat later, and a plumb line swings after it. Every one of those is driven off one shared spring, so nothing lags the shape making it. The comb assembles from the middle outwards on mount, a cell thickens and lifts under the cursor, and the light swells while work is in flight. Below it the action takes the selected accent and pushes a ring out for as long as something is running. The queue is yours: onGenerate hands you the model that was picked, you push a row, and the component types out any run that arrives after mount while leaving the rows that were already there alone.",
    category: "Data Display",
    tags: [
      "ai",
      "agent",
      "honeycomb",
      "picker",
      "queue",
      "typewriter",
      "console",
      "radio-group",
    ],
    status: "new",
    featured: true,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("agent-hive")],
    accessibility: [
      'The comb is a real radio group: `role="radiogroup"` on the frame, `role="radio"` with `aria-checked` on every occupied cell, and a roving tabindex — so a nine-model hive costs one tab stop and the arrows move inside it.',
      "Cells are glyph-only, so each carries its model name as `aria-label`, and the name is also printed under the comb where a sighted user can read it. The plumb line and the fill are decoration on top of that, never the only cue.",
      "Empty comb, the travelling fill and the plumb line are all `aria-hidden` and non-interactive; they are scenery, and they are not announced or focusable.",
      "The focus ring is drawn as a hexagon rather than left as the default outline, which would trace the cell's bounding box instead of the cell.",
      "The selected cell is the only filled one, so the selection survives a monochrome rendering, a forced-colours mode and any accent a consumer picks — fill and position carry it, not hue and not translucency.",
      "The material is decoration and degrades to a flat tint: a browser without `backdrop-filter` still gets a frosted wash, a lit edge and the tinted tile, because none of the three depends on the blur.",
      "Run states never rest on hue alone — every row prints its status in words next to the pip, and `status` overrides that word rather than removing it.",
      'The queue is an ordered list with `aria-live="polite"`, so a run arriving or landing is announced without stealing focus.',
      "A typing row renders its prompt twice: the full text, invisible but in the accessibility tree, under the prefix typed so far, which is `aria-hidden`. Assistive technology reads the whole line at once instead of a character at a time, and the row reserves its final height so nothing below it reflows while it types.",
      "The only continuous motion is the ring leaving the action, the pip on a working run and the swell in the light behind the comb — all three tied to the queue, and all three stopping when it does.",
      "`prefers-reduced-motion` is honoured structurally rather than by shortening durations: the mount wave, the typewriter, the caret, the ring, the swing, the wake and every spring are not started at all, and the tile is positioned rather than animated. What is left is a still component that still works.",
      "Both themes are covered by the tokens rather than by `dark:` variants, so the component keeps its contrast inside a forced-theme subtree.",
    ],
    keyboard: [
      {
        keys: ["→", "↓"],
        description: "Selects the next model in the comb, skipping disabled ones.",
      },
      {
        keys: ["←", "↑"],
        description: "Selects the previous model in the comb.",
      },
      { keys: ["Home"], description: "Selects the first model." },
      { keys: ["End"], description: "Selects the last model." },
      {
        keys: ["Tab"],
        description: "Moves from the comb to the action, and on out of the component.",
      },
      { keys: ["Enter", "Space"], description: "Fires the action." },
    ],
    props: [
      {
        name: "AgentHive",
        props: [
          {
            name: "models",
            type: "AgentHiveModel[]",
            required: true,
            description:
              "The models to lay into the comb. They fill it from the middle outwards, so the order is the order they radiate, not a row-by-row layout.",
          },
          {
            name: "value",
            type: "string",
            description:
              "Controlled selection, by model id. Leave unset to let the component hold it and read the selection through onValueChange.",
          },
          {
            name: "defaultValue",
            type: "string",
            description:
              'Where an uncontrolled comb starts. Defaults to the first enabled model. Pass value="" to start with nothing selected.',
          },
          {
            name: "onValueChange",
            type: "(id: string) => void",
            description: "Fires with the model id when the selection moves.",
          },
          {
            name: "runs",
            type: "AgentHiveRun[]",
            defaultValue: "[]",
            description:
              "The queue below the action, newest first. It is state you own, so it can come from anywhere — a websocket, a poll, a reducer.",
          },
          {
            name: "onGenerate",
            type: "(model: AgentHiveModel) => void",
            description:
              "Fires with the selected model when the action is pressed. Push a run onto runs from here.",
          },
          {
            name: "actionLabel",
            type: "string",
            defaultValue: '"Generate"',
            description: "Copy on the action.",
          },
          {
            name: "busy",
            type: "boolean",
            description:
              "Overrides the busy state, which is otherwise true whenever a run is working. Busy is what sets the rings leaving the action, the swell in the light behind the comb, and aria-busy on the frame — so a dispatch that has not reached the queue yet can still say so.",
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: "Disables the whole comb and the action.",
          },
          {
            name: "comb",
            type: "number[]",
            defaultValue: "[3, 4, 3]",
            description:
              "Widths of the comb's rows, top to bottom. Rows are centred on each other, which is where the half-cell offset comes from. More models than cells and the comb grows by alternating its own widest and narrowest row.",
          },
          {
            name: "size",
            type: '"sm" | "md"',
            defaultValue: '"md"',
            description: "Cell, action, row and type scale.",
          },
          {
            name: "arm",
            type: "boolean",
            defaultValue: "true",
            description:
              "The plumb line hanging over the selected cell. It tracks the cell's horizontal centre, so it can point down the corridor between two cells of the row below, and it swings on its own travelling velocity — a hop to the next cell tilts it, a jump across the comb throws it.",
          },
          {
            name: "maxRuns",
            type: "number",
            defaultValue: "3",
            description:
              "Rows drawn before the queue fades out. The overflow row dissolves into a mask rather than being cut off.",
          },
          {
            name: "typing",
            type: "boolean",
            defaultValue: "true",
            description:
              "Type each arriving run out a character at a time. Runs present at mount are treated as history and never type.",
          },
          {
            name: "typeSpeed",
            type: "number",
            defaultValue: "26",
            description: "Milliseconds per character. Floored at 4.",
          },
          {
            name: "emptyLabel",
            type: "string",
            defaultValue: '"Nothing queued."',
            description: "Shown in place of the queue while there is nothing in it.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Model"',
            description: "Accessible name of the comb.",
          },
          {
            name: "variant",
            type: '"card" | "plain"',
            defaultValue: '"card"',
            description:
              "Plain drops the surrounding rule, background and padding so the hive can sit inside your own container.",
          },
          {
            name: "className",
            type: "string",
            description:
              "Merged onto the root through `cn` — this is where the width goes, since the size only sets a max.",
          },
        ],
      },
      {
        name: "AgentHiveModel",
        description: "Shape of a single entry in the `models` array.",
        props: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Stable identity, and the value reported by onValueChange.",
          },
          {
            name: "label",
            type: "string",
            required: true,
            description:
              "The model's name. Printed under the comb, and the accessible name of its cell.",
          },
          {
            name: "description",
            type: "string",
            description:
              "Second line under the comb while the model holds the selection.",
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description:
              "Drawn inside the cell. Sized by the component, so pass a bare icon element — or a brand mark as inline SVG.",
          },
          {
            name: "accent",
            type: "string",
            description:
              "Any CSS colour. Tints the glass tile while the model holds the selection, lights the wash behind the comb, colours its glyph while it does not, carries into the action, and marks every run the model produced. Omit it and the component falls back to its ink tokens.",
          },
          {
            name: "disabled",
            type: "boolean",
            description:
              "Draws the cell at half strength and takes it out of both the tab order and the arrow-key walk.",
          },
        ],
      },
      {
        name: "AgentHiveRun",
        description: "Shape of a single entry in the `runs` array.",
        props: [
          {
            name: "id",
            type: "string",
            required: true,
            description:
              "Stable identity for the rendered row, and what the component keys typing off — reuse an id and the row is treated as the same run.",
          },
          {
            name: "prompt",
            type: "string",
            required: true,
            description:
              "The line of work. Typed out when the run arrives after mount.",
          },
          {
            name: "state",
            type: '"queued" | "working" | "done" | "failed"',
            defaultValue: '"queued"',
            description:
              "Picks the pip and the word beside it: grey for queued, amber and pulsing for working, green for done, red for failed.",
          },
          {
            name: "status",
            type: "string",
            description:
              "Overrides the status word — “Retrying”, “Queued · 3rd”, an elapsed time — without changing the hue.",
          },
          {
            name: "modelId",
            type: "string",
            description:
              "Ties the run to a model, which marks the row with that model's cell in miniature. Leave it out and the marker stays neutral.",
          },
        ],
      },
    ],
    usage: `import { AgentHive, type AgentHiveRun } from "@/components/joinui/agent-hive"
import { Asterisk, Atom, Gem, Sparkles } from "lucide-react"

const models = [
  { id: "aster", label: "Aster 3", icon: <Asterisk />, accent: "#c2410c" },
  { id: "prism", label: "Prism Flash", icon: <Sparkles />, accent: "#4338ca" },
  { id: "nimbus", label: "Nimbus 2", icon: <Atom />, accent: "#0f766e" },
  { id: "quartz", label: "Quartz Mini", icon: <Gem />, accent: "#15803d" },
]

export function Example() {
  const [runs, setRuns] = React.useState<AgentHiveRun[]>([])

  return (
    <AgentHive
      models={models}
      runs={runs}
      onGenerate={(model) =>
        setRuns((current) => [
          {
            id: crypto.randomUUID(),
            prompt: "Identify code optimizations and performance improvements",
            modelId: model.id,
            state: "working",
          },
          ...current,
        ])
      }
    />
  )
}`,
    customization: [
      {
        title: "Reshape the comb",
        description:
          "The comb prop is the row widths, top to bottom, and rows centre on each other — so [3, 4, 3] is a hexagon of hexagons, [1, 2, 1] is a diamond, and a single-element array is a straight row. Models always fill from the middle outwards, so the shape stays balanced whatever the count.",
        code: `{/* The default: ten cells, four of them models. */}
<AgentHive models={models} comb={[3, 4, 3]} />

{/* A diamond for four. */}
<AgentHive models={models} comb={[1, 2, 1]} size="sm" />

{/* One row, no scenery. */}
<AgentHive models={models} comb={[4]} />`,
      },
      {
        title: "Wire it to a real backend",
        description:
          "onGenerate hands you the model and gets out of the way. Push a working row, resolve it, and let the states carry the rest — the halo, the pulsing pip and aria-busy all follow from the run's state without a second prop.",
        code: `async function generate(model: AgentHiveModel) {
  const id = crypto.randomUUID()
  const prompt = draft.trim()

  setRuns((current) => [{ id, prompt, modelId: model.id, state: "working" }, ...current])

  try {
    await dispatch({ model: model.id, prompt })
    setRuns((current) =>
      current.map((run) => (run.id === id ? { ...run, state: "done" } : run))
    )
  } catch (error) {
    setRuns((current) =>
      current.map((run) =>
        run.id === id ? { ...run, state: "failed", status: "Retrying" } : run
      )
    )
  }
}`,
      },
      {
        title: "Bring your own marks",
        description:
          "An icon is any node, so the cells can carry real brand marks as inline SVG rather than an icon-set approximation. The component sizes them and leaves the fill alone unless an accent is set, in which case the glyph takes the accent and the action does too.",
        code: `const models = [
  {
    id: "orbit",
    label: "Orbit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-28 12 12)" />
      </svg>
    ),
    accent: "#7c3aed",
  },
]`,
      },
      {
        title: "Give the glass something to refract",
        description:
          "Frosting only has something to say when there is something behind it. On a flat panel the hive supplies its own light — the wash of the selected accent — but dropped onto a photograph, a gradient or a mesh, the cells sample it: the blur and the saturation boost are real, so the picture moves under the comb rather than beside it. Plain removes the frame so the surface can be yours.",
        code: `<div className="relative overflow-hidden rounded-3xl p-6">
  <img src="/aurora.jpg" alt="" className="absolute inset-0 size-full object-cover" />
  <AgentHive variant="plain" models={models} runs={runs} className="relative" />
</div>`,
      },
      {
        title: "Just the picker, or just the queue",
        description:
          "The three bands are independent. Drop runs and the queue collapses to its empty line; set maxRuns to keep a long queue from taking the page over. Plain removes the frame so the hive can sit inside a card of your own.",
        code: `{/* A picker in a settings panel. */}
<div className="rounded-xl border border-border p-6">
  <AgentHive
    variant="plain"
    models={models}
    comb={[2, 3, 2]}
    size="sm"
    actionLabel="Set default"
    emptyLabel="No recent runs."
  />
</div>

{/* A busy console: six rows in flight, three of them on screen. */}
<AgentHive models={models} runs={runs} maxRuns={3} />`,
      },
      {
        title: "Slow the typewriter down, or turn it off",
        description:
          "Typing is per run and happens once: a row that was on screen at mount is history and renders whole, and a row that arrives afterwards types itself out. Reduced motion turns it off on its own, so typing={false} is for when a queue is filling faster than anything can be read.",
        code: `{/* Deliberate, terminal-paced. */}
<AgentHive models={models} runs={runs} typeSpeed={45} />

{/* Straight to the text. */}
<AgentHive models={models} runs={runs} typing={false} />`,
      },
      {
        title: "Slow the whole thing down, or take the motion out",
        description:
          "The comb answers a pointer, a press and the tile going past it, and all three are gestures rather than decorations — so the component never moves on its own except while the queue is working. If a hive sits somewhere the motion would compete with the page, `arm={false}` drops the plumb line and the busy states carry on regardless; anyone who has asked their system for reduced motion already gets a still drawing without you doing anything.",
        code: `{/* No plumb line, and a comb that only moves when it is touched. */}
<AgentHive models={models} arm={false} runs={runs} />

{/* The busy signal, driven by you rather than read off the queue. */}
<AgentHive models={models} busy={isDispatching} runs={runs} />`,
      },
      {
        title: "Tune the material",
        description:
          "The glass is four numbers, and all four are custom properties rather than props, because they are a decision about the surface the component was installed onto rather than about any one hive. The frosting is a wash of the theme's own ink, which is what lets a single value serve both themes; the glow is the one exception, since the same 45% that reads as light on paper reads as a whisper on charcoal, so a product that lives in one theme should say so. The glyph on the tinted tile is near-white by default — if your accents are pale, redeclare it once instead of threading a second colour through every model.",
        language: "css",
        code: `/* app/globals.css */
:root {
  /* The frosting: at rest, empty, and under the cursor. */
  --agent-hive-glass: color-mix(in oklab, var(--foreground) 7%, transparent);
  --agent-hive-glass-empty: color-mix(in oklab, var(--foreground) 4%, transparent);
  --agent-hive-glass-lit: color-mix(in oklab, var(--foreground) 11%, transparent);
  /* How brightly the selected accent lights the comb from behind. */
  --agent-hive-glow: 0.45;
  /* The glyph on the tinted tile. */
  --agent-hive-glyph: oklch(0.985 0.002 90);
}

.dark {
  --agent-hive-glow: 0.55;
}`,
      },
    ],
    /**
     * Shipped with the registry item so `shadcn add` writes the run palette
     * into the consumer's `globals.css`. Both themes are declared, which is
     * what lets the component avoid `dark:` variants entirely.
     */
    cssVars: {
      theme: {
        "color-positive": "var(--positive)",
        "color-positive-soft": "var(--positive-soft)",
        "color-positive-foreground": "var(--positive-foreground)",
        "color-caution": "var(--caution)",
        "color-caution-soft": "var(--caution-soft)",
        "color-caution-foreground": "var(--caution-foreground)",
        "color-critical": "var(--critical)",
        "color-critical-soft": "var(--critical-soft)",
        "color-critical-foreground": "var(--critical-foreground)",
        "radius-soft-sm": "0.375rem",
        "radius-soft": "0.625rem",
        "radius-soft-lg": "1rem",
      },
      light: {
        positive: "oklch(0.5 0.13 158)",
        "positive-soft": "oklch(0.965 0.03 158)",
        "positive-foreground": "oklch(0.99 0.008 158)",
        caution: "oklch(0.53 0.13 68)",
        "caution-soft": "oklch(0.965 0.04 78)",
        "caution-foreground": "oklch(0.99 0.008 68)",
        critical: "oklch(0.52 0.19 23)",
        "critical-soft": "oklch(0.965 0.025 23)",
        "critical-foreground": "oklch(0.99 0.006 23)",
      },
      dark: {
        positive: "oklch(0.78 0.14 158)",
        "positive-soft": "oklch(0.25 0.05 158)",
        "positive-foreground": "oklch(0.16 0.035 158)",
        caution: "oklch(0.82 0.14 80)",
        "caution-soft": "oklch(0.26 0.05 68)",
        "caution-foreground": "oklch(0.17 0.035 68)",
        critical: "oklch(0.72 0.17 23)",
        "critical-soft": "oklch(0.26 0.07 23)",
        "critical-foreground": "oklch(0.16 0.04 23)",
      },
    },
    related: ["status-timeline", "focus-stack"],
    since: "2026-08-04",
  }),
]
