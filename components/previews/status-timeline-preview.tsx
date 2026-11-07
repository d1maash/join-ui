"use client"

import * as React from "react"
import { MapPin, Package, RotateCcw, ShoppingBag, Star, Truck } from "lucide-react"

import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"
import { cn } from "@/lib/utils"

const DELIVERY: StatusTimelineStep[] = [
  {
    id: "confirmed",
    title: "Order confirmed",
    description: "Payment captured, order placed.",
    timestamp: "17 Nov, 13:45",
    icon: <ShoppingBag />,
  },
  {
    id: "packed",
    title: "Packed",
    description: "Leaving the Rotterdam warehouse.",
    timestamp: "17 Nov, 16:02",
    icon: <Package />,
  },
  {
    id: "transit",
    title: "In transit",
    description: "Handed to the courier.",
    timestamp: "18 Nov, 08:20",
    icon: <Truck />,
  },
  {
    id: "delivered",
    title: "Delivered",
    description: "Signed for at the front desk.",
    timestamp: "19 Nov, 11:07",
    icon: <MapPin />,
  },
]

const CHECKOUT: StatusTimelineStep[] = [
  { id: "cart", title: "Cart" },
  { id: "address", title: "Address" },
  { id: "payment", title: "Payment" },
  { id: "review", title: "Review" },
]

const PIPELINE: StatusTimelineStep[] = [
  { id: "install", title: "Install", timestamp: "12s", state: "complete" },
  { id: "typecheck", title: "Typecheck", timestamp: "31s", state: "complete" },
  {
    id: "test",
    title: "Test",
    description: "4 of 212 assertions failed.",
    timestamp: "1m 04s",
    state: "blocked",
  },
  { id: "deploy", title: "Deploy", state: "pending" },
]

const ONBOARDING: StatusTimelineStep[] = [
  { id: "account", title: "Account created", state: "complete" },
  { id: "workspace", title: "Workspace configured", state: "complete" },
  {
    id: "review",
    title: "Identity review",
    description: "Usually clears within an hour.",
    state: "waiting",
  },
  { id: "invite", title: "Invite your team", state: "pending" },
]

/*
 * Two panels sharing one grid: the parent owns the rows, each panel spans both
 * of them through `subgrid`, and so the cards start on the same line however
 * many lines the caption above them happens to run to. `1fr` on the second row
 * then holds the two cards to a single height.
 */
const PAIR = "grid grid-cols-1 gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

export default function StatusTimelinePreview() {
  const [active, setActive] = React.useState(2)
  const done = active >= DELIVERY.length

  return (
    <div className="flex w-full max-w-5xl flex-col gap-14 font-sans">
      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption="Driven by activeStep"
          description="One index decides everything. Advance it and the line draws down, the next step turns blue and pulses once — then everything is still again."
        >
          <StatusTimeline
            label="Delivery"
            steps={DELIVERY}
            activeStep={active}
            className="max-w-md"
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  Step {Math.min(active + 1, DELIVERY.length)} of {DELIVERY.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button tone="gray" onClick={() => setActive(0)}>
                    <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                    Reset
                  </Button>
                  <Button onClick={() => setActive((step) => step + 1)} disabled={done}>
                    Advance
                  </Button>
                </div>
              </div>
            }
          />
        </Panel>

        <Panel
          className={ALIGNED}
          caption="Finished, with an action"
          description="Past the last index every step is complete, and the header chip turns green with it."
        >
          <StatusTimeline
            label="Delivery"
            steps={DELIVERY}
            activeStep={DELIVERY.length}
            className="max-w-md"
            footer={
              <Button tone="positive" className="h-10 w-full justify-center text-[0.9375rem]">
                <Star aria-hidden="true" className="size-4" strokeWidth={2.25} />
                Rate this delivery
              </Button>
            }
          />
        </Panel>
      </div>

      <Panel
        caption={<Code>orientation=&quot;horizontal&quot;</Code>}
        description="The same steps laid along a rail — a checkout or wizard header."
      >
        <StatusTimeline
          label="Checkout"
          steps={CHECKOUT}
          activeStep={1}
          orientation="horizontal"
          size="sm"
        />
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={<Code>state: &quot;waiting&quot;</Code>}
          description="Orange for a step that is neither moving nor broken — an approval, a review, a queue."
        >
          <StatusTimeline label="Onboarding" steps={ONBOARDING} className="max-w-md" />
        </Panel>

        <Panel
          className={ALIGNED}
          caption={<Code>state: &quot;blocked&quot;, variant=&quot;plain&quot;</Code>}
          description="Red for a step that failed. Plain drops the card and the header, so the list sits in a surface you own."
        >
          <StatusTimeline
            steps={PIPELINE}
            size="sm"
            variant="plain"
            showHeader={false}
            label="Pipeline"
            className="max-w-md"
          />
        </Panel>
      </div>
    </div>
  )
}

function Panel({
  caption,
  description,
  className,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
  description: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-5", className)}>
      <div className="flex max-w-xl flex-col gap-1.5 px-1">
        <span className="text-[1.0625rem] leading-[1.375rem] font-semibold tracking-[-0.022em] text-foreground">
          {caption}
        </span>
        <p className="text-[0.9375rem] leading-[1.35rem] tracking-[-0.009em] text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: string }) {
  return <code className="font-mono text-[0.92em] font-medium text-foreground">{children}</code>
}

/**
 * The button styles the demo needs: tinted for the action, grey beside it —
 * a demo affordance, not the site's own button.
 */
function Button({
  tone = "tinted",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  tone?: "tinted" | "gray" | "positive"
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-semibold tracking-[-0.006em]",
        "transition-[background-color,opacity,scale] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "tinted" && "bg-info-soft text-info hover:bg-info/20",
        tone === "gray" && "bg-muted/70 text-foreground hover:bg-muted",
        tone === "positive" && "bg-positive-soft text-positive hover:bg-positive/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
