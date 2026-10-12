"use client"

import { MapPin, Package, Truck } from "lucide-react"

import {
  StatusTimeline,
  type StatusTimelineStep,
} from "@/registry/components/status-timeline"

import { useBeats } from "./clock"

const DELIVERY: StatusTimelineStep[] = [
  { id: "packed", title: "Packed", timestamp: "16:02", icon: <Package /> },
  { id: "transit", title: "In transit", timestamp: "08:20", icon: <Truck /> },
  { id: "delivered", title: "Delivered", timestamp: "11:07", icon: <MapPin /> },
]

/*
 * One beat per advance, and a longer one on the finished order before the
 * tracker goes back to the start — the reset is a snap, not a move, so it
 * should not come the moment the last step lands.
 */
const BEATS = [1600, 1600, 2600] as const

export default function StatusTimelineThumbnail() {
  const { beat } = useBeats(BEATS, 1)

  return (
    <StatusTimeline
      label="Delivery"
      steps={DELIVERY}
      activeStep={beat + 1}
      size="sm"
      className="w-full max-w-72"
    />
  )
}
