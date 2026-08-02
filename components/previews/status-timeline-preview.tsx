"use client"

import * as React from "react"
import { MapPin, Package, RefreshCw, ShoppingBag, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"

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

export default function StatusTimelinePreview() {
  const [active, setActive] = React.useState(2)
  const done = active >= DELIVERY.length

  return (
    <div className="flex w-full max-w-5xl flex-col gap-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <Panel
          caption="Driven by activeStep"
          description="One index decides everything: earlier steps read as complete, the rest as pending."
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={done}
                    onClick={() => setActive((step) => step + 1)}
                  >
                    Advance
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActive(0)}>
                    <RefreshCw aria-hidden="true" />
                    Reset
                  </Button>
                </div>
              </div>
            }
          />
        </Panel>

        <Panel
          caption="Finished, with an action"
          description="Past the last index every step is complete and the header chip follows along."
        >
          <StatusTimeline
            label="Delivery"
            steps={DELIVERY}
            activeStep={DELIVERY.length}
            className="max-w-md"
            footer={
              <Button variant="secondary" size="sm" className="w-full">
                <Star aria-hidden="true" />
                Rate this delivery
              </Button>
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

      <Panel
        caption='Per-step state, variant="plain"'
        description="Set state on a step to break out of the sequence — here a failed run, with the card chrome and header dropped."
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
