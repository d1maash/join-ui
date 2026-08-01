import { defineComponent, uiFile } from "@/lib/registry/define"
import type { ComponentMetadata } from "@/types/registry"

/**
 * The single source of truth for the whole site.
 *
 * Catalog cards, component pages, docs navigation, the search index, install
 * commands, `/r/*.json` registry items, AI prompts and related-component links
 * are all projected from this array. Add a component here and it appears
 * everywhere; nothing below is repeated anywhere else in the codebase.
 */
export const components: ComponentMetadata[] = [
  defineComponent({
    name: "MagneticButton",
    slug: "magnetic-button",
    title: "Magnetic Button",
    description:
      "A button that eases toward the pointer as it approaches and springs back on exit.",
    overview:
      "MagneticButton adds a physical quality to primary calls to action without changing how the button behaves. A wrapper element carries the spring-driven transform so the interactive element itself is never re-parented, which keeps `asChild` working with Next.js `Link` and keeps the accessibility tree stable. The pointer listener is throttled to one frame, attaches only while the button is near the viewport, and is skipped entirely under reduced motion.",
    category: "Buttons",
    tags: ["button", "cursor", "spring", "cta", "pointer"],
    status: "stable",
    featured: true,
    dependencies: ["motion", "@radix-ui/react-slot"],
    registryDependencies: ["utils"],
    files: [uiFile("magnetic-button")],
    accessibility: [
      "Renders a real `button` element, so `Enter`, `Space`, form submission and disabled semantics all work natively.",
      "The magnetic transform is decorative and lives on a wrapper — assistive technology sees an ordinary button.",
      "Focus is shown with a 2px `outline-ring` at a 2px offset, never removed.",
      "Disabled buttons drop pointer events and opt out of the effect entirely.",
      "`prefers-reduced-motion: reduce` disables the pull; the button stays fully functional.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves focus to the button." },
      { keys: ["Enter", "Space"], description: "Activates the button." },
    ],
    props: [
      {
        name: "MagneticButton",
        props: [
          {
            name: "variant",
            type: '"primary" | "secondary" | "outline" | "ghost"',
            defaultValue: '"primary"',
            description: "Visual weight of the button.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"md"',
            description: "Height, padding and type scale.",
          },
          {
            name: "strength",
            type: "number",
            defaultValue: "0.32",
            description:
              "Fraction of the pointer offset the button travels. 0 disables the pull, 1 pins it to the cursor.",
          },
          {
            name: "radius",
            type: "number",
            defaultValue: "120",
            description: "Pointer distance in pixels at which the pull begins.",
          },
          {
            name: "labelStrength",
            type: "number",
            defaultValue: "0.45",
            description: "Extra parallax applied to the label, relative to `strength`.",
          },
          {
            name: "asChild",
            type: "boolean",
            defaultValue: "false",
            description:
              "Render the child element instead of a `button` — use for links.",
          },
          {
            name: "wrapperClassName",
            type: "string",
            description: "Class applied to the element that carries the transform.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the button with `cn`.",
          },
          {
            name: "...props",
            type: "React.ComponentPropsWithoutRef<'button'>",
            description:
              "All native button attributes, including `disabled` and `type`.",
          },
        ],
      },
    ],
    usage: `import { MagneticButton } from "@/components/joinway/magnetic-button"
import { ArrowRight } from "lucide-react"

export function Example() {
  return (
    <MagneticButton size="lg">
      Get started
      <ArrowRight />
    </MagneticButton>
  )
}`,
    customization: [
      {
        title: "Wrap a link",
        description:
          "`asChild` forwards everything to the child, so routing and prefetching keep working.",
        code: `import Link from "next/link"

<MagneticButton asChild variant="outline">
  <Link href="/components">Browse components</Link>
</MagneticButton>`,
      },
      {
        title: "Tune the physics",
        description:
          "A wider radius with a lower strength reads as a gentle drift; the inverse feels snappy and mechanical.",
        code: `<MagneticButton strength={0.18} radius={220}>
  Subtle drift
</MagneticButton>

<MagneticButton strength={0.55} radius={80}>
  Snappy
</MagneticButton>`,
      },
    ],
    related: ["spotlight-card", "floating-dock", "cursor-highlight"],
    since: "2026-03-14",
  }),

  defineComponent({
    name: "SpotlightCard",
    slug: "spotlight-card",
    title: "Spotlight Card",
    description:
      "A surface that lights up under the pointer, with an optional glowing border.",
    overview:
      "SpotlightCard tracks the pointer and paints a soft radial light where the cursor sits, plus an optional 1px border that catches the same light. Coordinates are written to CSS custom properties inside a single animation frame, so a grid of cards costs no React re-renders while the pointer moves. Focusing anything inside the card reveals a centred spotlight, which keeps the affordance available to keyboard users.",
    category: "Cards",
    tags: ["card", "spotlight", "hover", "glow", "surface"],
    status: "stable",
    featured: true,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("spotlight-card")],
    accessibility: [
      "The lighting layers are `aria-hidden` and `pointer-events-none`; they never intercept clicks.",
      "Keyboard focus inside the card triggers the same highlight, so the effect is not hover-only.",
      "No information is conveyed by the spotlight alone — it is purely decorative.",
      "Contrast of the card content is unaffected because the light sits on a `-z-10` layer.",
      "Uses only compositor-friendly properties, so it degrades to a plain card without motion.",
    ],
    keyboard: [
      {
        keys: ["Tab"],
        description:
          "Moving focus into the card reveals a centred spotlight; leaving it fades the light out.",
      },
    ],
    props: [
      {
        name: "SpotlightCard",
        props: [
          {
            name: "spotlightSize",
            type: "number",
            defaultValue: "340",
            description: "Diameter of the light pool, in pixels.",
          },
          {
            name: "spotlightColor",
            type: "string",
            defaultValue: '"color-mix(in oklab, var(--primary) 26%, transparent)"',
            description: "Any CSS colour. Accepts design tokens.",
          },
          {
            name: "borderGlow",
            type: "boolean",
            defaultValue: "true",
            description: "Trace the card border with the same light.",
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: "Opt out of the effect without changing the markup.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the card container.",
          },
        ],
      },
      {
        name: "SpotlightCardHeader / Title / Description / Content",
        description: "Optional layout helpers so cards line up without utility soup.",
        props: [
          {
            name: "className",
            type: "string",
            description: "Merged onto the respective element.",
          },
        ],
      },
    ],
    usage: `import {
  SpotlightCard,
  SpotlightCardContent,
  SpotlightCardDescription,
  SpotlightCardHeader,
  SpotlightCardTitle,
} from "@/components/joinway/spotlight-card"

export function Example() {
  return (
    <SpotlightCard className="max-w-sm">
      <SpotlightCardHeader>
        <SpotlightCardTitle>Edge routing</SpotlightCardTitle>
        <SpotlightCardDescription>
          Requests resolve at the nearest region automatically.
        </SpotlightCardDescription>
      </SpotlightCardHeader>
      <SpotlightCardContent>
        <p className="text-sm text-muted-foreground">42 regions online</p>
      </SpotlightCardContent>
    </SpotlightCard>
  )
}`,
    customization: [
      {
        title: "Recolour the light",
        description:
          "Any CSS colour works. Use `color-mix` with a token so the card follows your theme.",
        code: `<SpotlightCard
  spotlightColor="color-mix(in oklab, var(--accent) 32%, transparent)"
  spotlightSize={420}
/>`,
      },
      {
        title: "Border only",
        description:
          "Drop the fill and keep the traced edge for a quieter treatment on dense grids.",
        code: `<SpotlightCard
  spotlightColor="transparent"
  borderGlow
  className="bg-transparent"
/>`,
      },
    ],
    related: ["gradient-border-card", "cursor-highlight", "bento-grid"],
    since: "2026-03-14",
  }),

  defineComponent({
    name: "MorphingTabs",
    slug: "morphing-tabs",
    title: "Morphing Tabs",
    description:
      "Tabs whose indicator morphs between items with a shared-layout animation.",
    overview:
      "MorphingTabs implements the WAI-ARIA tabs pattern with roving `tabindex` and a selection indicator that travels between tabs using Motion's shared layout animation instead of fading. It ships two variants — a pill segmented control and an underline — and leaves panels under your control so it can act as a filter bar, a segmented control, or full tabs with panels.",
    category: "Navigation",
    tags: ["tabs", "navigation", "layout-animation", "segmented", "indicator"],
    status: "stable",
    featured: true,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("morphing-tabs")],
    accessibility: [
      'Implements the WAI-ARIA tabs pattern: `role="tablist"`, `role="tab"` and `aria-selected` on every tab.',
      "Roving `tabindex` — only the selected tab is in the tab sequence, so `Tab` moves past the whole group.",
      "Arrow keys move between tabs and skip disabled ones; `Home` and `End` jump to the ends.",
      "`aria-controls` links each tab to its panel when `panelId` is provided, and `MorphingTabsPanel` sets `aria-labelledby` back.",
      "The moving indicator is `aria-hidden`; selection is communicated through `aria-selected`, not colour.",
      "Reduced motion collapses the indicator transition to zero duration.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves focus into or out of the tab list." },
      {
        keys: ["→", "↓"],
        description: "Selects and focuses the next enabled tab, wrapping around.",
      },
      {
        keys: ["←", "↑"],
        description: "Selects and focuses the previous enabled tab, wrapping around.",
      },
      { keys: ["Home"], description: "Selects the first enabled tab." },
      { keys: ["End"], description: "Selects the last enabled tab." },
    ],
    props: [
      {
        name: "MorphingTabs",
        props: [
          {
            name: "items",
            type: "MorphingTabItem[]",
            required: true,
            description:
              "`{ value, label, icon?, badge?, disabled?, panelId? }` for each tab.",
          },
          {
            name: "value",
            type: "string",
            description: "Controlled selection.",
          },
          {
            name: "defaultValue",
            type: "string",
            description:
              "Uncontrolled initial selection. Defaults to the first enabled tab.",
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: "Fired on click and on arrow-key selection.",
          },
          {
            name: "variant",
            type: '"pill" | "underline"',
            defaultValue: '"pill"',
            description: "Indicator treatment.",
          },
          {
            name: "size",
            type: '"sm" | "md"',
            defaultValue: '"md"',
            description: "Control height and type scale.",
          },
          {
            name: "fullWidth",
            type: "boolean",
            defaultValue: "false",
            description: "Stretch tabs to fill the container.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Tabs"',
            description: "Accessible name applied to the tab list.",
          },
          {
            name: "layoutId",
            type: "string",
            description:
              "Shared-layout id. Set it when two tab lists are visible at once.",
          },
        ],
      },
      {
        name: "MorphingTabsPanel",
        description:
          "Optional animated panel. Bring your own if you need custom transitions.",
        props: [
          {
            name: "value",
            type: "string",
            required: true,
            description: "Panel's tab value.",
          },
          {
            name: "activeValue",
            type: "string",
            required: true,
            description: "Currently selected tab value.",
          },
          {
            name: "tabId",
            type: "string",
            description: "`id` of the controlling tab, used for `aria-labelledby`.",
          },
        ],
      },
    ],
    usage: `"use client"

import * as React from "react"
import { MorphingTabs } from "@/components/joinway/morphing-tabs"

export function Example() {
  const [tab, setTab] = React.useState("overview")

  return (
    <MorphingTabs
      label="Project sections"
      value={tab}
      onValueChange={setTab}
      items={[
        { value: "overview", label: "Overview" },
        { value: "activity", label: "Activity", badge: 12 },
        { value: "settings", label: "Settings" },
      ]}
    />
  )
}`,
    customization: [
      {
        title: "Underline variant with panels",
        description:
          "Pass `panelId` per item and render `MorphingTabsPanel` to get the full tabs pattern.",
        code: `const [tab, setTab] = React.useState("code")

<MorphingTabs
  variant="underline"
  value={tab}
  onValueChange={setTab}
  items={[
    { value: "code", label: "Code", panelId: "panel-code" },
    { value: "docs", label: "Docs", panelId: "panel-docs" },
  ]}
/>

<MorphingTabsPanel id="panel-code" value="code" activeValue={tab}>
  <pre>npm install</pre>
</MorphingTabsPanel>`,
      },
      {
        title: "As a filter bar",
        description:
          "Skip panels entirely and treat it as a segmented control over a list.",
        code: `<MorphingTabs
  size="sm"
  fullWidth
  label="Filter results"
  defaultValue="all"
  onValueChange={setFilter}
  items={[
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed", disabled: !hasClosed },
  ]}
/>`,
      },
    ],
    related: ["floating-dock", "animated-command-menu", "expandable-feature-card"],
    since: "2026-03-28",
  }),

  defineComponent({
    name: "AuroraBackground",
    slug: "aurora-background",
    title: "Aurora Background",
    description:
      "A GPU-friendly animated backdrop built from three drifting colour fields.",
    overview:
      "AuroraBackground renders three blurred radial fields that drift slowly behind your content. Only `transform` is animated, so the effect stays on the compositor and off the main thread, and an IntersectionObserver pauses it whenever the section scrolls out of view. A fine grain overlay kills the banding that large blurred gradients usually produce on 8-bit displays.",
    category: "Backgrounds",
    tags: ["background", "gradient", "aurora", "hero", "ambient"],
    status: "stable",
    featured: true,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("aurora-background")],
    accessibility: [
      "The whole aurora layer is `aria-hidden` and `pointer-events-none`.",
      "`prefers-reduced-motion: reduce` freezes the fields into a static gradient via a media query inside the component's own stylesheet.",
      "Content is rendered above the aurora in a separate stacking context so text contrast is never reduced by the animation.",
      "Nothing is conveyed by the background alone.",
    ],
    keyboard: [],
    props: [
      {
        name: "AuroraBackground",
        props: [
          {
            name: "intensity",
            type: '"subtle" | "medium" | "vivid"',
            defaultValue: '"medium"',
            description: "Opacity of the colour fields.",
          },
          {
            name: "speed",
            type: "number",
            defaultValue: "18",
            description: "Seconds for one drift cycle. Higher is calmer.",
          },
          {
            name: "blur",
            type: "number",
            defaultValue: "72",
            description: "Blur radius of each field, in pixels.",
          },
          {
            name: "grain",
            type: "boolean",
            defaultValue: "true",
            description: "Overlay a noise texture to prevent gradient banding.",
          },
          {
            name: "asLayer",
            type: "boolean",
            defaultValue: "false",
            description:
              "Render only the absolutely positioned aurora, for dropping into an existing `relative` container.",
          },
          {
            name: "className",
            type: "string",
            description: "Merged onto the outer wrapper (or the layer when `asLayer`).",
          },
        ],
      },
    ],
    usage: `import { AuroraBackground } from "@/components/joinway/aurora-background"

export function Example() {
  return (
    <AuroraBackground className="rounded-xl border border-border">
      <div className="px-8 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Ship faster</h2>
        <p className="mt-2 text-muted-foreground">
          Deploy from your terminal in one command.
        </p>
      </div>
    </AuroraBackground>
  )
}`,
    customization: [
      {
        title: "Drop into an existing section",
        description:
          "`asLayer` skips the content wrapper so you can position the aurora yourself.",
        code: `<section className="relative isolate overflow-hidden">
  <AuroraBackground asLayer intensity="subtle" speed={26} />
  <div className="relative">{children}</div>
</section>`,
      },
      {
        title: "Rebrand the palette",
        description:
          "The fields read `--brand-from`, `--brand-via` and `--brand-to`. Override them on any ancestor.",
        code: `<div
  style={{
    "--brand-from": "oklch(0.7 0.18 300)",
    "--brand-via": "oklch(0.72 0.16 260)",
    "--brand-to": "oklch(0.8 0.14 200)",
  } as React.CSSProperties}
>
  <AuroraBackground intensity="vivid" />
</div>`,
      },
    ],
    related: ["gradient-border-card", "spotlight-card", "cursor-highlight"],
    since: "2026-04-02",
  }),

  defineComponent({
    name: "GradientBorderCard",
    slug: "gradient-border-card",
    title: "Gradient Border Card",
    description: "A card wrapped in a conic gradient that rotates around its edge.",
    overview:
      "GradientBorderCard draws a rotating conic sweep behind the card and clips it to a hairline border. The rotation is a plain `transform` on a clipped layer rather than an animated `@property` angle, so it needs no custom-property registration, works everywhere `conic-gradient` does, and stays on the compositor. The sweep pauses automatically when the card leaves the viewport.",
    category: "Cards",
    tags: ["card", "border", "gradient", "conic", "highlight"],
    status: "stable",
    featured: false,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("gradient-border-card")],
    accessibility: [
      "The gradient ring and bloom are `aria-hidden` and non-interactive.",
      "Content sits on an opaque `bg-card` surface, so text contrast is unaffected by the animation.",
      "`prefers-reduced-motion: reduce` stops the rotation and leaves a static gradient edge.",
      "The border is decorative — pair it with a real border or heading when it marks a featured item.",
    ],
    keyboard: [],
    props: [
      {
        name: "GradientBorderCard",
        props: [
          {
            name: "borderWidth",
            type: "number",
            defaultValue: "1",
            description: "Thickness of the gradient edge, in pixels.",
          },
          {
            name: "duration",
            type: "number",
            defaultValue: "6",
            description: "Seconds per full rotation.",
          },
          {
            name: "animate",
            type: "boolean",
            defaultValue: "true",
            description: "Freeze the gradient in place when false.",
          },
          {
            name: "glow",
            type: "boolean",
            defaultValue: "true",
            description: "Ambient bloom behind the card.",
          },
          {
            name: "colors",
            type: "string[]",
            description:
              "Conic colour stops. Defaults to the brand ramp; `transparent` entries create the sweep's tail.",
          },
          {
            name: "innerClassName",
            type: "string",
            description: "Class applied to the inner content surface.",
          },
        ],
      },
    ],
    usage: `import { GradientBorderCard } from "@/components/joinway/gradient-border-card"

export function Example() {
  return (
    <GradientBorderCard className="max-w-sm" innerClassName="p-6">
      <h3 className="text-base font-semibold">Pro plan</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Unlimited projects and priority support.
      </p>
    </GradientBorderCard>
  )
}`,
    customization: [
      {
        title: "Single-colour comet",
        description:
          "Mostly transparent stops leave one bright head chasing the border.",
        code: `<GradientBorderCard
  duration={4}
  colors={[
    "transparent",
    "transparent",
    "var(--primary)",
    "transparent",
    "transparent",
  ]}
/>`,
      },
      {
        title: "Static featured state",
        description: "Turn the animation off but keep the gradient to mark a plan.",
        code: `<GradientBorderCard animate={false} borderWidth={2} glow={false}>
  <div className="p-6">Most popular</div>
</GradientBorderCard>`,
      },
    ],
    related: ["spotlight-card", "aurora-background", "bento-grid"],
    since: "2026-04-11",
  }),

  defineComponent({
    name: "AnimatedCommandMenu",
    slug: "animated-command-menu",
    title: "Animated Command Menu",
    description:
      "A command palette that scales in from the caret, with fuzzy search and grouped results.",
    overview:
      "AnimatedCommandMenu composes Radix Dialog and cmdk into a palette with a spring entrance and a real exit animation. Radix supplies the focus trap, scroll lock, `Escape` handling and inert background; cmdk supplies fuzzy filtering and roving selection. `forceMount` plus `AnimatePresence` means focus returns to the trigger only after the exit transition finishes, so the dialog never disappears mid-animation.",
    category: "Overlays",
    tags: ["command", "palette", "search", "dialog", "cmdk", "shortcut"],
    status: "new",
    featured: true,
    dependencies: ["cmdk", "@radix-ui/react-dialog", "motion"],
    registryDependencies: ["utils"],
    files: [uiFile("animated-command-menu")],
    accessibility: [
      "Radix Dialog provides a focus trap, restores focus to the trigger on close, and marks background content inert.",
      "`Escape` closes the palette, and a click on the overlay dismisses it.",
      "The dialog has an accessible name from a visually hidden `Dialog.Title`, announced on open.",
      'cmdk maintains `aria-selected` on the active option and `role="listbox"` semantics for results.',
      "Selection is announced by moving DOM focus into the input with `aria-activedescendant` semantics from cmdk.",
      "The reduced-motion path removes the scale transition but keeps every behaviour.",
    ],
    keyboard: [
      {
        keys: ["⌘ K", "Ctrl K"],
        description: "Toggles the palette. Configurable via `shortcut`.",
      },
      { keys: ["↑", "↓"], description: "Moves through results, wrapping at the ends." },
      { keys: ["Enter"], description: "Runs the selected command." },
      { keys: ["Esc"], description: "Closes the palette and restores focus." },
    ],
    props: [
      {
        name: "AnimatedCommandMenu",
        props: [
          {
            name: "groups",
            type: "CommandMenuGroup[]",
            required: true,
            description:
              "`{ heading, items }` where each item is `{ value, label, description?, icon?, shortcut?, keywords?, onSelect }`.",
          },
          {
            name: "open",
            type: "boolean",
            description:
              "Controlled visibility. Omit to let the component own its state.",
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "Fired whenever the palette opens or closes.",
          },
          {
            name: "shortcut",
            type: "string | null",
            defaultValue: '"k"',
            description:
              "Character combined with Cmd/Ctrl. Pass `null` to disable the built-in shortcut.",
          },
          {
            name: "placeholder",
            type: "string",
            defaultValue: '"Search commands…"',
            description: "Input placeholder.",
          },
          {
            name: "emptyMessage",
            type: "React.ReactNode",
            defaultValue: '"No results found."',
            description: "Shown when the filter matches nothing.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Command menu"',
            description: "Accessible name of the dialog.",
          },
          {
            name: "footer",
            type: "React.ReactNode",
            description: "Optional hint bar pinned to the bottom of the palette.",
          },
        ],
      },
    ],
    usage: `"use client"

import { AnimatedCommandMenu } from "@/components/joinway/animated-command-menu"
import { FileText, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export function Example() {
  const router = useRouter()

  return (
    <AnimatedCommandMenu
      groups={[
        {
          heading: "Navigation",
          items: [
            {
              value: "home",
              label: "Go home",
              icon: <Home />,
              shortcut: ["G", "H"],
              onSelect: () => router.push("/"),
            },
            {
              value: "docs",
              label: "Open docs",
              icon: <FileText />,
              onSelect: () => router.push("/docs"),
            },
          ],
        },
      ]}
    />
  )
}`,
    customization: [
      {
        title: "Drive it from your own trigger",
        description:
          "Control `open` yourself and pass `shortcut={null}` if you already own the key handler.",
        code: `const [open, setOpen] = React.useState(false)

<button onClick={() => setOpen(true)}>Search…</button>
<AnimatedCommandMenu open={open} onOpenChange={setOpen} shortcut={null} groups={groups} />`,
      },
      {
        title: "Add a hint bar",
        description:
          "The footer is a plain node — put shortcut legends or counts there.",
        code: `<AnimatedCommandMenu
  groups={groups}
  footer={
    <span className="flex items-center gap-3">
      <span>↑↓ to navigate</span>
      <span>↵ to select</span>
    </span>
  }
/>`,
      },
    ],
    related: ["morphing-tabs", "floating-dock", "text-scramble"],
    since: "2026-05-06",
  }),

  defineComponent({
    name: "FloatingDock",
    slug: "floating-dock",
    title: "Floating Dock",
    description:
      "A navigation dock whose icons swell as the pointer sweeps across them.",
    overview:
      "FloatingDock is a compact navigation bar with macOS-style magnification. All icons derive their size from one shared motion value, so the dock installs a single pointer listener regardless of how many items it holds. Magnification is treated strictly as decoration: it is disabled on coarse-pointer devices and under reduced motion, where the dock renders as an ordinary row of comfortably sized targets.",
    category: "Navigation",
    tags: ["dock", "navigation", "magnify", "toolbar", "macos"],
    status: "stable",
    featured: true,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("floating-dock")],
    accessibility: [
      "Rendered as a `nav` landmark with an accessible name from `label`.",
      "Each item is a real `a` or `button` with an `aria-label`, so the icon-only design still has a name.",
      'The active item sets `aria-current="page"`.',
      "Labels appear on keyboard focus as well as hover via `group-focus-within`, so nothing is hover-only.",
      "Tooltips are `aria-hidden` to avoid announcing the name twice.",
      "On coarse pointers the dock drops magnification and renders 40px targets that meet WCAG 2.2 target-size guidance.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves through dock items in order." },
      { keys: ["Enter"], description: "Follows a link item." },
      { keys: ["Enter", "Space"], description: "Activates a button item." },
    ],
    props: [
      {
        name: "FloatingDock",
        props: [
          {
            name: "items",
            type: "FloatingDockItem[]",
            required: true,
            description: "`{ label, icon, href?, onClick?, active? }` for each entry.",
          },
          {
            name: "baseSize",
            type: "number",
            defaultValue: "40",
            description: "Resting icon size in pixels.",
          },
          {
            name: "magnifiedSize",
            type: "number",
            defaultValue: "68",
            description: "Icon size directly under the pointer.",
          },
          {
            name: "falloff",
            type: "number",
            defaultValue: "140",
            description: "Distance in pixels over which magnification fades out.",
          },
          {
            name: "label",
            type: "string",
            defaultValue: '"Quick navigation"',
            description: "Accessible name of the `nav` landmark.",
          },
        ],
      },
    ],
    usage: `import { FloatingDock } from "@/components/joinway/floating-dock"
import { Home, Layers, Settings } from "lucide-react"

export function Example() {
  return (
    <FloatingDock
      label="Primary"
      items={[
        { label: "Home", icon: <Home />, href: "/", active: true },
        { label: "Components", icon: <Layers />, href: "/components" },
        { label: "Settings", icon: <Settings />, onClick: () => {} },
      ]}
    />
  )
}`,
    customization: [
      {
        title: "Pin it to the viewport",
        description: "The dock is layout-agnostic — position it however you like.",
        code: `<FloatingDock
  items={items}
  className="fixed inset-x-0 bottom-6 z-40"
/>`,
      },
      {
        title: "Calmer magnification",
        description:
          "A smaller delta between base and magnified size reads as refined rather than playful.",
        code: `<FloatingDock items={items} baseSize={44} magnifiedSize={56} falloff={100} />`,
      },
    ],
    related: ["morphing-tabs", "magnetic-button", "animated-command-menu"],
    since: "2026-04-20",
  }),

  defineComponent({
    name: "TextScramble",
    slug: "text-scramble",
    title: "Text Scramble",
    description: "Decodes text from noise into its final form, without hurting SEO.",
    overview:
      "TextScramble reveals a string one character at a time while scrambling the rest. The animation writes to `textContent` through a ref, so a long headline costs zero re-renders, and the readable string is rendered on the server and exposed through `aria-label` — screen readers, search engines and users with reduced motion only ever encounter the final text.",
    category: "Text Effects",
    tags: ["text", "typography", "scramble", "reveal", "hero"],
    status: "stable",
    featured: false,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("text-scramble")],
    accessibility: [
      "The final string is set as `aria-label` on the wrapper and the animating node is `aria-hidden`, so assistive technology never reads scrambled characters.",
      "The readable text is server-rendered, so it is present for crawlers and for users without JavaScript.",
      "`prefers-reduced-motion: reduce` renders the final text immediately with no animation.",
      "No flashing: characters change at frame rate but luminance stays constant, staying clear of WCAG 2.3.1 thresholds.",
      '`trigger="hover"` is an enhancement — the text is fully readable before any interaction.',
    ],
    keyboard: [],
    props: [
      {
        name: "TextScramble",
        props: [
          {
            name: "text",
            type: "string",
            required: true,
            description:
              "The final, readable string. Always exposed to assistive technology.",
          },
          {
            name: "characters",
            type: "string",
            defaultValue: "A–Z plus symbols",
            description: "Pool the scrambler draws noise from.",
          },
          {
            name: "speed",
            type: "number",
            defaultValue: "2",
            description: "Frames spent per revealed character. Higher is slower.",
          },
          {
            name: "delay",
            type: "number",
            defaultValue: "0",
            description: "Milliseconds to wait before starting.",
          },
          {
            name: "trigger",
            type: '"mount" | "view" | "hover"',
            defaultValue: '"mount"',
            description:
              "When to run. `view` waits for the element to scroll into the viewport.",
          },
          {
            name: "as",
            type: "React.ElementType",
            defaultValue: '"span"',
            description: "Element to render, e.g. `h1`.",
          },
        ],
      },
    ],
    usage: `import { TextScramble } from "@/components/joinway/text-scramble"

export function Example() {
  return (
    <TextScramble
      as="h1"
      text="Build faster interfaces"
      trigger="view"
      className="text-4xl font-semibold tracking-tight"
    />
  )
}`,
    customization: [
      {
        title: "Binary noise",
        description: "Restrict the character pool for a terminal feel.",
        code: `<TextScramble text="0.0.42 deployed" characters="01" speed={3} />`,
      },
      {
        title: "Staggered lines",
        description: "Offset each line with `delay` to cascade a multi-line headline.",
        code: `{lines.map((line, index) => (
  <TextScramble key={line} text={line} delay={index * 220} trigger="view" />
))}`,
      },
    ],
    related: ["metric-card", "aurora-background", "expandable-feature-card"],
    since: "2026-04-25",
  }),

  defineComponent({
    name: "ExpandableFeatureCard",
    slug: "expandable-feature-card",
    title: "Expandable Feature Card",
    description:
      "A feature tile that grows to reveal detail instead of navigating away.",
    overview:
      "ExpandableFeatureCard turns a marketing tile into a progressive-disclosure control. The entire header is one button carrying `aria-expanded` and `aria-controls`, and the revealed content is a labelled region, so the relationship survives in the accessibility tree rather than living only in the animation. Height animates from `auto` through Motion and collapses to an instant reveal under reduced motion.",
    category: "Marketing",
    tags: ["card", "accordion", "disclosure", "features", "marketing"],
    status: "stable",
    featured: false,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("expandable-feature-card")],
    accessibility: [
      "The header is a single `button` with `aria-expanded` and `aria-controls` pointing at the panel.",
      'The panel is a `role="region"` labelled by the header, so it is reachable from a landmark list.',
      'A visually hidden "Show more" / "Show less" string gives the toggle an unambiguous name.',
      "The chevron is `aria-hidden` — state is conveyed by `aria-expanded`, not by rotation.",
      "Works controlled or uncontrolled, so it can be driven from an accordion group without breaking semantics.",
      "Reduced motion removes the height transition and reveals content immediately.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves focus to the card header." },
      { keys: ["Enter", "Space"], description: "Expands or collapses the card." },
    ],
    props: [
      {
        name: "ExpandableFeatureCard",
        props: [
          {
            name: "title",
            type: "React.ReactNode",
            required: true,
            description: "Feature name shown in the header.",
          },
          {
            name: "description",
            type: "React.ReactNode",
            required: true,
            description: "Always-visible summary line.",
          },
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: "Content revealed when expanded.",
          },
          { name: "icon", type: "React.ReactNode", description: "Leading glyph." },
          {
            name: "defaultOpen",
            type: "boolean",
            defaultValue: "false",
            description: "Uncontrolled initial state.",
          },
          { name: "open", type: "boolean", description: "Controlled state." },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "Fired on every toggle.",
          },
          {
            name: "expandLabel",
            type: "string",
            defaultValue: '"Show more"',
            description: "Visually hidden label when collapsed.",
          },
          {
            name: "collapseLabel",
            type: "string",
            defaultValue: '"Show less"',
            description: "Visually hidden label when expanded.",
          },
        ],
      },
    ],
    usage: `import { ExpandableFeatureCard } from "@/components/joinway/expandable-feature-card"
import { Zap } from "lucide-react"

export function Example() {
  return (
    <ExpandableFeatureCard
      icon={<Zap />}
      title="Instant rollbacks"
      description="Every deploy is immutable and reversible."
    >
      Roll back to any previous deployment in under a second. Traffic shifts
      atomically, so no request is ever served a half-updated build.
    </ExpandableFeatureCard>
  )
}`,
    customization: [
      {
        title: "One-at-a-time accordion",
        description:
          "Control `open` from a parent to get exclusive expansion across a list.",
        code: `const [openId, setOpenId] = React.useState<string | null>(null)

{features.map((feature) => (
  <ExpandableFeatureCard
    key={feature.id}
    open={openId === feature.id}
    onOpenChange={(next) => setOpenId(next ? feature.id : null)}
    title={feature.title}
    description={feature.description}
  >
    {feature.detail}
  </ExpandableFeatureCard>
))}`,
      },
      {
        title: "Inside a bento grid",
        description: "Pair it with BentoGrid for an interactive feature section.",
        code: `<BentoGrid columns={2}>
  <BentoGridItem colSpan={2} className="p-0">
    <ExpandableFeatureCard className="border-0" title="…" description="…">
      …
    </ExpandableFeatureCard>
  </BentoGridItem>
</BentoGrid>`,
      },
    ],
    related: ["bento-grid", "spotlight-card", "morphing-tabs"],
    since: "2026-05-19",
  }),

  defineComponent({
    name: "CursorHighlight",
    slug: "cursor-highlight",
    title: "Cursor Highlight",
    description:
      "A highlight that snaps onto whatever the user points at — or tabs to.",
    overview:
      "CursorHighlight paints a soft, spring-driven rectangle behind the nearest `[data-highlight]` descendant, morphing between targets instead of jumping. It also tracks `focusin`, so keyboard users get exactly the same affordance — the reason it works as real navigation chrome rather than a hover-only flourish. A `follow` mode trades snapping for a blurred circle that trails the pointer.",
    category: "Experimental",
    tags: ["cursor", "highlight", "pointer", "focus", "spring"],
    status: "experimental",
    featured: false,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("cursor-highlight")],
    accessibility: [
      "Tracks `focusin` as well as `pointermove`, so the highlight is never hover-only.",
      "The highlight layer is `aria-hidden`, `pointer-events-none` and sits at `-z-10`.",
      "Reduced motion swaps the spring for a near-instant snap rather than removing the affordance.",
      "Children keep their own focus styles — the highlight supplements them, never replaces them.",
      "Because it is purely visual, screen reader users lose nothing when it is not rendered.",
    ],
    keyboard: [
      {
        keys: ["Tab"],
        description:
          "Moving focus onto a `[data-highlight]` element moves the highlight with it.",
      },
    ],
    props: [
      {
        name: "CursorHighlight",
        props: [
          {
            name: "mode",
            type: '"snap" | "follow"',
            defaultValue: '"snap"',
            description:
              "`snap` locks onto `[data-highlight]` descendants; `follow` trails a soft circle.",
          },
          {
            name: "padding",
            type: "number",
            defaultValue: "8",
            description: "Extra pixels around a snapped target.",
          },
          {
            name: "radius",
            type: "number",
            defaultValue: "12",
            description: "Corner radius of the highlight, in pixels.",
          },
          {
            name: "size",
            type: "number",
            defaultValue: "220",
            description: "Diameter of the follow-mode circle.",
          },
          {
            name: "highlightClassName",
            type: "string",
            description: "Class applied to the highlight itself — restyle it freely.",
          },
        ],
      },
    ],
    usage: `import { CursorHighlight } from "@/components/joinway/cursor-highlight"

export function Example() {
  return (
    <CursorHighlight className="flex flex-col gap-1 p-2">
      {["Overview", "Analytics", "Settings"].map((item) => (
        <a key={item} href="#" data-highlight className="rounded-md px-3 py-2 text-sm">
          {item}
        </a>
      ))}
    </CursorHighlight>
  )
}`,
    customization: [
      {
        title: "Follow mode",
        description: "A blurred orb that trails the pointer across a hero section.",
        code: `<CursorHighlight mode="follow" size={320} className="min-h-64">
  {children}
</CursorHighlight>`,
      },
      {
        title: "Restyle the highlight",
        description:
          "`highlightClassName` replaces the default fill, so it can become a ring or a shadow.",
        code: `<CursorHighlight
  highlightClassName="border-2 border-accent bg-transparent"
  padding={4}
/>`,
      },
    ],
    related: ["spotlight-card", "magnetic-button", "floating-dock"],
    since: "2026-06-08",
  }),

  defineComponent({
    name: "AnimatedField",
    slug: "animated-field",
    title: "Animated Field",
    description:
      "A text field whose label floats out of the way and whose underline draws in on focus.",
    overview:
      "AnimatedField is the input most design systems end up rewriting: a floating label, a focus underline that draws from the centre, validation tones and an optional character counter. Everything the animation implies is also encoded semantically — a real `<label for>`, `aria-describedby` wiring for hints and errors, `aria-invalid` on failure, and a polite live region so corrections are announced without stealing focus.",
    category: "Forms",
    tags: ["input", "form", "label", "validation", "field"],
    status: "new",
    featured: false,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("animated-field")],
    accessibility: [
      "Uses a real `<label htmlFor>` — the floating position is styling only, so the field always has a programmatic name.",
      "Hint, error and counter nodes are linked through `aria-describedby`.",
      '`aria-invalid` is set when `error` is present, and the message carries `role="alert"`.',
      'The message region is `aria-live="polite"` for hints and assertive for errors, so validation is announced without moving focus.',
      "Error state is signalled by text and an icon-free message, never by border colour alone.",
      "The placeholder only appears once the label has floated, so it never overlaps the label text.",
      "Works controlled or uncontrolled, so it drops into React Hook Form or a plain `<form>` unchanged.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves focus into and out of the field." },
      {
        keys: ["Any character"],
        description: "Typing floats the label and updates the counter.",
      },
    ],
    props: [
      {
        name: "AnimatedField",
        props: [
          {
            name: "label",
            type: "string",
            required: true,
            description: "Visible, programmatically associated label.",
          },
          {
            name: "description",
            type: "string",
            description: "Helper text below the field.",
          },
          {
            name: "error",
            type: "string",
            description: "Error message. Sets `aria-invalid` and the error tone.",
          },
          {
            name: "success",
            type: "string",
            description: "Confirmation message shown when the field is valid.",
          },
          { name: "icon", type: "React.ReactNode", description: "Leading glyph." },
          {
            name: "showCounter",
            type: "boolean",
            defaultValue: "false",
            description:
              "Show a live `length / maxLength` counter. Requires `maxLength`.",
          },
          {
            name: "containerClassName",
            type: "string",
            description: "Class applied to the outer wrapper.",
          },
          {
            name: "...props",
            type: "React.ComponentPropsWithoutRef<'input'>",
            description:
              "All native input attributes, including `type` and `required`.",
          },
        ],
      },
    ],
    usage: `"use client"

import * as React from "react"
import { AnimatedField } from "@/components/joinway/animated-field"
import { Mail } from "lucide-react"

export function Example() {
  const [email, setEmail] = React.useState("")
  const invalid = email.length > 0 && !email.includes("@")

  return (
    <AnimatedField
      label="Work email"
      type="email"
      icon={<Mail />}
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      error={invalid ? "Enter a valid email address." : undefined}
      description="We only use this for deploy notifications."
    />
  )
}`,
    customization: [
      {
        title: "With a character counter",
        description: "Pair `showCounter` with `maxLength` for bounded fields.",
        code: `<AnimatedField
  label="Display name"
  maxLength={32}
  showCounter
  description="Shown on your public profile."
/>`,
      },
      {
        title: "Uncontrolled inside a form",
        description:
          "Skip `value` entirely and read the field from `FormData` on submit.",
        code: `<form action={createProject}>
  <AnimatedField name="project" label="Project name" required />
  <button type="submit">Create</button>
</form>`,
      },
    ],
    related: ["status-pulse", "magnetic-button", "morphing-tabs"],
    since: "2026-06-22",
  }),

  defineComponent({
    name: "StatusPulse",
    slug: "status-pulse",
    title: "Status Pulse",
    description:
      "A live status indicator with an expanding ring and a real text label.",
    overview:
      "StatusPulse is the small piece every dashboard and status page ends up rewriting: a coloured dot, an expanding ring, and a label. It refuses to encode meaning in colour alone — the label is always rendered as text — and when `live` is set the wrapper becomes a polite status region so a change from operational to degraded is announced without interrupting the user.",
    category: "Feedback",
    tags: ["status", "indicator", "live", "dashboard", "badge"],
    status: "stable",
    featured: false,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("status-pulse")],
    accessibility: [
      "Meaning is never colour-only — the textual label is always rendered.",
      '`role="status"` with `aria-live="polite"` announces changes without interrupting; set `live={false}` when many indicators share a page.',
      "The dot and ring are `aria-hidden`.",
      "The ring pulses at 0.5 Hz, well under the WCAG 2.3.1 three-flashes threshold.",
      "`prefers-reduced-motion: reduce` replaces the pulse with a static halo.",
    ],
    keyboard: [],
    props: [
      {
        name: "StatusPulse",
        props: [
          {
            name: "tone",
            type: '"operational" | "degraded" | "outage" | "maintenance" | "idle"',
            defaultValue: '"operational"',
            description: "Semantic state. Drives colour and the default label.",
          },
          {
            name: "label",
            type: "React.ReactNode",
            description: "Overrides the tone's default label.",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            defaultValue: '"md"',
            description: "Dot and type scale.",
          },
          {
            name: "pulse",
            type: "boolean",
            defaultValue: "true",
            description: "Draw the expanding ring. Always off for `idle`.",
          },
          {
            name: "variant",
            type: '"bare" | "chip"',
            defaultValue: '"bare"',
            description: "Wrap in a bordered chip instead of bare text.",
          },
          {
            name: "live",
            type: "boolean",
            defaultValue: "true",
            description: "Announce changes through a polite live region.",
          },
          {
            name: "detail",
            type: "React.ReactNode",
            description: "Timestamp or secondary detail after the label.",
          },
        ],
      },
    ],
    usage: `import { StatusPulse } from "@/components/joinway/status-pulse"

export function Example() {
  return (
    <div className="flex flex-col gap-3">
      <StatusPulse tone="operational" variant="chip" />
      <StatusPulse tone="degraded" detail="since 14:02" />
      <StatusPulse tone="outage" label="EU-West unreachable" />
    </div>
  )
}`,
    customization: [
      {
        title: "Quiet mode for dense tables",
        description:
          "Turn off the live region when dozens of indicators render at once, or the announcements pile up.",
        code: `{rows.map((row) => (
  <StatusPulse key={row.id} size="sm" live={false} tone={row.tone} label={row.name} />
))}`,
      },
      {
        title: "Retone it",
        description:
          "Tones map to `--success`, `--warning`, `--destructive` and `--primary`. Override the tokens to rebrand.",
        code: `<div style={{ "--success": "oklch(0.72 0.16 145)" } as React.CSSProperties}>
  <StatusPulse tone="operational" />
</div>`,
      },
    ],
    related: ["metric-card", "animated-field", "spotlight-card"],
    since: "2026-05-30",
  }),

  defineComponent({
    name: "MetricCard",
    slug: "metric-card",
    title: "Metric Card",
    description: "A KPI tile with a count-up figure, a signed delta and a sparkline.",
    overview:
      "MetricCard animates a figure from zero when it scrolls into view, then annotates it with a period-over-period delta and an optional inline sparkline. The count-up writes to `textContent` through a ref so it costs no re-renders, and the final value is server-rendered — the number is correct even if JavaScript never runs or the user prefers reduced motion. `invertTrend` handles metrics where down is good.",
    category: "Data Display",
    tags: ["metric", "kpi", "counter", "sparkline", "dashboard"],
    status: "updated",
    featured: true,
    dependencies: ["motion"],
    registryDependencies: ["utils"],
    files: [uiFile("metric-card")],
    accessibility: [
      "The final value is rendered on the server, so the correct number is in the DOM before any animation runs.",
      "Trend direction is carried by an arrow glyph and the signed percentage, not by colour alone.",
      'The sparkline is `role="img"` with an `aria-label` describing the period it covers.',
      "`prefers-reduced-motion: reduce` skips the count-up and shows the final figure immediately.",
      "Figures use `tabular-nums`, so counting does not shift the layout.",
    ],
    keyboard: [],
    props: [
      {
        name: "MetricCard",
        props: [
          {
            name: "label",
            type: "string",
            required: true,
            description: "Metric name.",
          },
          {
            name: "value",
            type: "number",
            required: true,
            description: "Final value. Counts up when the card enters the viewport.",
          },
          {
            name: "prefix",
            type: "string",
            defaultValue: '""',
            description: "e.g. `$`.",
          },
          {
            name: "suffix",
            type: "string",
            defaultValue: '""',
            description: "e.g. `%` or `ms`.",
          },
          {
            name: "precision",
            type: "number",
            defaultValue: "0",
            description: "Decimal places kept while counting.",
          },
          {
            name: "delta",
            type: "number",
            description:
              "Period-over-period change in percent. The sign drives the trend.",
          },
          {
            name: "deltaLabel",
            type: "string",
            defaultValue: '"vs. last period"',
            description: "Describes what the delta compares against.",
          },
          {
            name: "series",
            type: "number[]",
            description: "Values for the inline sparkline. Needs at least two points.",
          },
          {
            name: "invertTrend",
            type: "boolean",
            defaultValue: "false",
            description: "For metrics where a decrease is good — latency, churn, cost.",
          },
          {
            name: "duration",
            type: "number",
            defaultValue: "1.1",
            description: "Count-up duration in seconds.",
          },
        ],
      },
    ],
    usage: `import { MetricCard } from "@/components/joinway/metric-card"

export function Example() {
  return (
    <MetricCard
      label="Monthly revenue"
      value={48250}
      prefix="$"
      delta={12.4}
      series={[12, 18, 15, 24, 22, 31, 38]}
    />
  )
}`,
    customization: [
      {
        title: "Lower is better",
        description:
          "`invertTrend` flips the colour logic so a falling latency reads as an improvement.",
        code: `<MetricCard
  label="p95 latency"
  value={182}
  suffix="ms"
  delta={-8.3}
  invertTrend
/>`,
      },
      {
        title: "In a responsive grid",
        description: "The card fills its cell, so any grid works.",
        code: `<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {metrics.map((metric) => (
    <MetricCard key={metric.label} {...metric} />
  ))}
</div>`,
      },
    ],
    related: ["status-pulse", "bento-grid", "text-scramble"],
    since: "2026-06-30",
  }),

  defineComponent({
    name: "BentoGrid",
    slug: "bento-grid",
    title: "Bento Grid",
    description:
      "A dense, responsive bento layout that collapses to one readable column.",
    overview:
      "BentoGrid is an auto-flowing dense grid with span helpers, and it is a Server Component — it ships no JavaScript at all. Spans are looked up from a static map rather than interpolated into class names, so Tailwind can see every class at build time and nothing gets purged in production. Tiles accept a decorative background layer, and `href` turns a whole tile into a link with proper hover and focus affordances.",
    category: "Layout",
    tags: ["grid", "bento", "layout", "server-component", "responsive"],
    status: "stable",
    featured: false,
    dependencies: [],
    registryDependencies: ["utils"],
    files: [uiFile("bento-grid")],
    accessibility: [
      "Ships zero client JavaScript — a Server Component with no interactivity of its own.",
      "Collapses to a single column below `md`, so reading order always matches the DOM order.",
      "Linked tiles are real anchors with a visible `focus-visible` ring; the whole tile is the target.",
      "Tile headings render as `h3`, so they slot under your section heading without breaking the outline.",
      "Decorative background layers are `aria-hidden` and `pointer-events-none`.",
    ],
    keyboard: [
      { keys: ["Tab"], description: "Moves through linked tiles in DOM order." },
      { keys: ["Enter"], description: "Follows a linked tile." },
    ],
    props: [
      {
        name: "BentoGrid",
        props: [
          {
            name: "columns",
            type: "2 | 3 | 4",
            defaultValue: "3",
            description: "Columns from the `md` breakpoint up. Always one on mobile.",
          },
          {
            name: "rowHeight",
            type: "string",
            defaultValue: '"11rem"',
            description: "Minimum height of a single-row tile.",
          },
        ],
      },
      {
        name: "BentoGridItem",
        props: [
          {
            name: "colSpan",
            type: "1 | 2 | 3 | 4",
            defaultValue: "1",
            description: "Columns the tile spans at `md` and up.",
          },
          {
            name: "rowSpan",
            type: "1 | 2 | 3",
            defaultValue: "1",
            description: "Rows the tile spans at `md` and up.",
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: "Rendered as an `h3`.",
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: "Body copy below the title.",
          },
          { name: "icon", type: "React.ReactNode", description: "Leading glyph." },
          {
            name: "background",
            type: "React.ReactNode",
            description: "Decorative layer behind the content.",
          },
          {
            name: "href",
            type: "string",
            description: "Turns the whole tile into a link.",
          },
        ],
      },
    ],
    usage: `import { BentoGrid, BentoGridItem } from "@/components/joinway/bento-grid"
import { Gauge, Lock, Rocket } from "lucide-react"

export function Example() {
  return (
    <BentoGrid columns={3}>
      <BentoGridItem
        colSpan={2}
        icon={<Rocket />}
        title="Instant deploys"
        description="Push to main and your build is live in seconds."
      />
      <BentoGridItem icon={<Lock />} title="Private by default" />
      <BentoGridItem icon={<Gauge />} title="Edge metrics" href="/metrics" />
    </BentoGrid>
  )
}`,
    customization: [
      {
        title: "Feature tile with a live background",
        description:
          "Any node works as a background — pair it with AuroraBackground for a hero tile.",
        code: `<BentoGridItem
  colSpan={2}
  rowSpan={2}
  title="Global edge network"
  background={<AuroraBackground asLayer intensity="subtle" />}
/>`,
      },
      {
        title: "Taller rows",
        description: "`rowHeight` sets the grid's `auto-rows` floor.",
        code: `<BentoGrid columns={4} rowHeight="14rem">
  {children}
</BentoGrid>`,
      },
    ],
    related: ["spotlight-card", "expandable-feature-card", "metric-card"],
    since: "2026-07-09",
  }),
]
