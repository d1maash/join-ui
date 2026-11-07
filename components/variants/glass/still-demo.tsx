"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import { useStill } from "./hooks"

/**
 * A tiny demonstration of the reduced-motion rule: three pills drifting in a
 * stack, and a switch that does what the system setting does — the motion
 * stops and the layout it was moving between is simply there, complete.
 *
 * When the visitor already has Reduce Motion on, the switch starts on and the
 * pills never move at all.
 */
export function StillDemo() {
  const systemStill = useStill()
  const [override, setOverride] = React.useState<boolean | null>(null)
  const still = override ?? systemStill

  return (
    <div className="flex flex-col items-start gap-6">
      <div
        aria-hidden="true"
        className="g-inset relative flex h-[132px] w-full items-center justify-center overflow-hidden rounded-[22px]"
      >
        {["#0a84ff", "#bf5af2", "#ff375f"].map((color, index) => (
          <span
            key={color}
            className={cn("g-drift absolute h-9 rounded-full", still && "g-drift-still")}
            style={{
              width: 132 - index * 22,
              background: color,
              opacity: 0.9 - index * 0.18,
              top: 26 + index * 30,
              animationDelay: `${index * -1.4}s`,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={still}
        onClick={() => setOverride(!still)}
        className="flex cursor-pointer items-center gap-3 rounded-full text-[15px] tracking-[-0.012em] text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]"
      >
        <span
          className={cn(
            "relative flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-300",
            still ? "bg-[#34c759]" : "bg-[rgb(120_120_128/0.24)]"
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 600, damping: 36 }}
            className={cn(
              "size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)]",
              still ? "ml-auto" : "ml-0"
            )}
          />
        </span>
        Reduce Motion
      </button>
    </div>
  )
}
