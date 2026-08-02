"use client"

import * as React from "react"
import { MapPin, Package, RefreshCw, ShoppingBag, Star, Truck } from "lucide-react"

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

export default function StatusTimelinePreview() {
  const [active, setActive] = React.useState(2)
  const done = active >= DELIVERY.length

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <Panel
          caption="Driven by activeStep"
          description="One index decides everything: earlier steps go green, the one in flight turns blue and pulses, the rest stay grey."
        >
          <StatusTimeline
            label="Delivery"
            steps={DELIVERY}
            activeStep={active}
            className="max-w-md"
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {Math.min(active + 1, DELIVERY.length)} / {DELIVERY.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <Pill onClick={() => setActive((step) => step + 1)} disabled={done}>
                    Advance
                  </Pill>
                  <Pill tone="quiet" onClick={() => setActive(0)}>
                    <RefreshCw aria-hidden="true" className="size-3.5" />
                    Reset
                  </Pill>
                </div>
              </div>
            }
          />
        </Panel>

        <Panel
          caption="Finished, with an action"
          description="Past the last index every step is complete, and the header chip goes green with it."
        >
          <StatusTimeline
            label="Delivery"
            steps={DELIVERY}
            activeStep={DELIVERY.length}
            className="max-w-md"
            footer={
              <Pill tone="positive" className="w-full justify-center">
                <Star aria-hidden="true" className="size-3.5" />
                Rate this delivery
              </Pill>
            }
          />
        </Panel>
      </div>

      <Panel
        caption='orientation="horizontal"'
        description="The same steps laid along a rule — a checkout or wizard header."
      >
        <StatusTimeline
          label="Checkout"
          steps={CHECKOUT}
          activeStep={1}
          orientation="horizontal"
          size="sm"
        />
      </Panel>

      <div className="grid gap-10 lg:grid-cols-2">
        <Panel
          caption='state: "waiting"'
          description="Amber for a step that is neither moving nor broken — an approval, a review, a queue."
        >
          <StatusTimeline label="Onboarding" steps={ONBOARDING} className="max-w-md" />
        </Panel>

        <Panel
          caption='state: "blocked", variant="plain"'
          description="Red for a step that failed, with the card and header dropped so the list can sit in a surface you own."
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
  children,
}: {
  caption: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {caption}
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

/** Rounded, tinted control — the site's own buttons are square and achromatic. */
function Pill({
  tone = "neutral",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  tone?: "neutral" | "quiet" | "positive"
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "neutral" &&
          "bg-info-soft text-info hover:bg-info hover:text-info-foreground",
        tone === "quiet" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        tone === "positive" &&
          "bg-positive-soft text-positive hover:bg-positive hover:text-positive-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
