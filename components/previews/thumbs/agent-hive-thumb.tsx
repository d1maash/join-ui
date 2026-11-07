"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"

/*
 * The product shot: the comb, the selection gliding across it, and the run it
 * produces typing itself into the queue — on a loop, and as a finished frame
 * under reduced motion. The scene is laid out at one fixed size and scaled to
 * the tile, so the comb keeps its proportions at every size a tile comes in.
 */
const SCENE = { width: 440, height: 400 }

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const MODELS: AgentHiveModel[] = [
  {
    id: "prism",
    label: "Prism Flash",
    description: "Drafts and rewrites",
    accent: "oklch(0.52 0.2 268)",
    icon: (
      <Mark>
        <path d="M10.4 2.8c.5 4.1 2.1 5.7 6.2 6.2-4.1.5-5.7 2.1-6.2 6.2-.5-4.1-2.1-5.7-6.2-6.2 4.1-.5 5.7-2.1 6.2-6.2Z" />
        <path d="M17.6 14.4c.26 2 1.04 2.78 3.04 3.04-2 .26-2.78 1.04-3.04 3.04-.26-2-1.04-2.78-3.04-3.04 2-.26 2.78-1.04 3.04-3.04Z" />
      </Mark>
    ),
  },
  {
    id: "aster",
    label: "Aster 3",
    description: "Long context",
    accent: "oklch(0.63 0.19 42)",
    icon: (
      <Mark>
        <path d="M12 2.9v18.2M4.12 7.45l15.76 9.1M4.12 16.55l15.76-9.1" />
      </Mark>
    ),
  },
  {
    id: "nimbus",
    label: "Nimbus 2",
    description: "Code and structured output",
    accent: "oklch(0.55 0.13 195)",
    icon: (
      <Mark>
        <circle cx="12" cy="7.9" r="4.1" />
        <circle cx="8.3" cy="14.3" r="4.1" />
        <circle cx="15.7" cy="14.3" r="4.1" />
      </Mark>
    ),
  },
  {
    id: "quartz",
    label: "Quartz Mini",
    description: "Cheap enough for every row",
    accent: "oklch(0.5 0.15 155)",
    icon: (
      <Mark>
        <path d="M12 3.2 5.6 12 12 20.8 18.4 12 12 3.2Z" />
        <path d="M6.4 12h11.2" />
      </Mark>
    ),
  },
]

/* The order the loop walks, chosen so the tile crosses the comb each time. */
const WALK = ["prism", "quartz", "aster", "nimbus"]

const PROMPTS = [
  "Summarise this week's incidents",
  "Draft migration notes for pricing",
  "Find every unlabelled button",
  "Explain the failing checkout test",
]

const STILL_RUN: AgentHiveRun = {
  id: "still",
  prompt: PROMPTS[0]!,
  modelId: "prism",
  state: "done",
}

/** One beat of the loop: pick, then generate, then land. */
const BEAT = 3200
const GENERATE_AT = 800
const LAND_AT = 2500

export default function AgentHiveThumb() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const [step, setStep] = React.useState(0)
  const [runs, setRuns] = React.useState<AgentHiveRun[]>([STILL_RUN])

  React.useEffect(() => {
    if (reduceMotion) return
    const timers: number[] = []
    let beat = 0

    const play = () => {
      beat += 1
      const at = beat
      const modelId = WALK[at % WALK.length]!
      setStep(at)
      timers.push(
        window.setTimeout(() => {
          setRuns([
            {
              id: `run-${at}`,
              prompt: PROMPTS[at % PROMPTS.length]!,
              modelId,
              state: "working",
            },
          ])
        }, GENERATE_AT),
        window.setTimeout(() => {
          setRuns((current) =>
            current.map((run) =>
              run.id === `run-${at}` ? { ...run, state: "done" as const } : run
            )
          )
        }, LAND_AT)
      )
    }

    const loop = window.setInterval(play, BEAT)
    return () => {
      window.clearInterval(loop)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [reduceMotion])

  const selected = WALK[step % WALK.length]!
  const accent = MODELS.find((model) => model.id === selected)?.accent

  return (
    <div ref={frame} className="relative size-full overflow-hidden">
      {/* The room the glass sits in: a breath of the selection's colour. */}
      <div
        aria-hidden="true"
        className="absolute top-[12%] left-1/2 h-[46%] w-[52%] -translate-x-1/2 rounded-full opacity-[0.12] blur-[48px] transition-[background-color] duration-700"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: SCENE.width,
          height: SCENE.height,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        <AgentHive
          variant="plain"
          label="Model"
          models={MODELS}
          value={selected}
          runs={runs}
          maxRuns={1}
          className="max-w-[22rem]"
        />
      </div>
    </div>
  )
}

/**
 * The scale at which a `width` × `height` scene fits its frame, read off the
 * frame's own box and kept current as it resizes. Null until the first
 * measurement, so the scene is never painted at the wrong size.
 */
function useFit(width: number, height: number) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<number | null>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const box = entry.contentRect
      if (box.width === 0 || box.height === 0) return
      setScale(Math.min(box.width / width, box.height / height))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [width, height])

  return [ref, scale] as const
}
