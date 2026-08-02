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
      "A step tracker for orders, deployments and onboarding, where each state is carried by fill, glyph and label at once.",
    overview:
      "StatusTimeline renders a fixed sequence of steps and marks where the process currently stands. Pass an activeStep index and it derives the rest — earlier steps read as complete, later ones as pending — or pin a state per step to describe a run that stalled. It lays out vertically as a tracking card or horizontally as a wizard header, and every state is announced in text as well as drawn, so it survives the achromatic palette.",
    category: "Data Display",
    tags: ["timeline", "stepper", "progress", "status", "order", "tracker", "steps"],
    status: "new",
    featured: true,
    dependencies: ["motion", "lucide-react"],
    registryDependencies: ["utils"],
    files: [uiFile("status-timeline")],
    accessibility: [
      "Steps render as an ordered list, so assistive technology reports both position and total.",
      'The step in flight carries `aria-current="step"`.',
      "Every step appends a visually hidden state label — “Completed”, “In progress”, “Not started”, “Blocked” — so the marker's fill is never the only signal.",
      "The list is named by the header eyebrow through `aria-labelledby`, or by `label` when the header is hidden.",
      "Markers, connectors and the pulse ring are `aria-hidden` and non-interactive; only content you pass to `footer` enters the tab order.",
      "Step reveals and the pulse animate `transform` and `opacity` only, and stop entirely under `prefers-reduced-motion`.",
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
            type: '"complete" | "current" | "pending" | "blocked"',
            description:
              "Pins the state instead of deriving it from activeStep. Use blocked for a step that failed.",
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
        title: "Pin a step that failed",
        description:
          "A state on the step wins over the one derived from activeStep, so a stalled run can be described exactly. The header chip picks up the blocked state on its own.",
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
        code: `<div className="border border-border p-6">
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
          "Anything passed to footer renders below a rule. It is the only part of the component that can take focus.",
        code: `<StatusTimeline
  label="Delivery"
  activeStep={steps.length}
  steps={steps}
  footer={
    <Button variant="secondary" size="sm" className="w-full">
      <Star aria-hidden="true" />
      Rate this delivery
    </Button>
  }
/>`,
      },
    ],
    related: [],
    since: "2026-08-02",
  }),
]
