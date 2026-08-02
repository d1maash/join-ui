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
      "A colour-coded step tracker for orders, deployments and onboarding, with a pulsing marker on the step in flight.",
    overview:
      "StatusTimeline renders a fixed sequence of steps and marks where the process currently stands. Pass an activeStep index and it derives the rest — earlier steps turn green, the one in flight turns blue and pulses, the rest stay grey — or pin a state per step to describe a run that is waiting on someone or has failed outright. It lays out vertically as a tracking card or horizontally as a wizard header, and every hue is backed by a glyph and a text label, so the state never rests on colour alone.",
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
      "Markers, trails and the pulse ring are `aria-hidden` and non-interactive; only content you pass to `footer` enters the tab order.",
      "Step reveals and the pulse animate `transform` and `opacity` only, and stop entirely under `prefers-reduced-motion`.",
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
    usage: `import { StatusTimeline } from "@/components/joinway/status-timeline"

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
          "An icon replaces the default state glyph while the fill and the hidden state label keep carrying the meaning. The component sizes it, so pass the element bare.",
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
]
