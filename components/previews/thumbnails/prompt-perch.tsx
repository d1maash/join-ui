"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { AppWindow, Hourglass, LayoutGrid, Lightbulb, Smartphone } from "lucide-react"

import {
  PromptPerch,
  type PromptPerchIdeaGroup,
  type PromptPerchOption,
} from "@/registry/components/prompt-perch"

/*
 * The product shot: the robot on its perch, reading a prompt as it is typed
 * in, thinking once it is sent, and hopping when the work comes back — then
 * the next prompt. The card is inert, but the robot still follows the pointer
 * while it is over the card. Under reduced motion the scene is one still
 * frame with a prompt in the field. Laid out at one fixed size and scaled to
 * the tile.
 */
const SCENE = { width: 640, height: 470 }

const IDEAS: PromptPerchIdeaGroup[] = [
  {
    value: "suggested",
    label: "Suggested",
    icon: <Lightbulb strokeWidth={1.75} />,
    ideas: [
      {
        label: "A developer portfolio with project cards and a contact form",
        icon: <LayoutGrid strokeWidth={1.75} />,
      },
      {
        label: "A landing page for a time-tracking app",
        icon: <Hourglass strokeWidth={1.75} />,
      },
    ],
  },
  { value: "apps", label: "Apps", icon: <Smartphone strokeWidth={1.75} />, ideas: [] },
  {
    value: "websites",
    label: "Websites",
    icon: <AppWindow strokeWidth={1.75} />,
    ideas: [],
  },
]

const STYLES: PromptPerchOption[] = [{ value: "minimal", label: "Minimal" }]
const MODELS: PromptPerchOption[] = [{ value: "auto", label: "Auto" }]

const PROMPTS = [
  "A homepage for a small coffee roaster",
  "A habit tracker with a weekly heatmap",
  "A conference site with a schedule and tickets",
]

/** The beats of one take, in milliseconds. */
const WAIT = 1200
const KEY = 42
const READ = 800
const THINK = 2200
const REST = 1500

export default function PromptPerchThumb() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)
  const reduceMotion = useReducedMotion()
  const [value, setValue] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (reduceMotion) return
    const timers: number[] = []
    let take = 0
    const run = () => {
      const prompt = PROMPTS[take % PROMPTS.length]!
      take += 1
      let at = WAIT
      for (let index = 1; index <= prompt.length; index += 1) {
        timers.push(window.setTimeout(() => setValue(prompt.slice(0, index)), at))
        at += KEY
      }
      at += READ
      timers.push(
        window.setTimeout(() => {
          setValue("")
          setBusy(true)
        }, at)
      )
      at += THINK
      timers.push(window.setTimeout(() => setBusy(false), at))
      at += REST
      timers.push(window.setTimeout(run, at))
    }
    run()
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [reduceMotion])

  return (
    <div ref={frame} className="relative size-full overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 flex items-center"
        style={{
          width: SCENE.width,
          height: SCENE.height,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        <PromptPerch
          placeholder="What do you want to design?"
          value={reduceMotion ? PROMPTS[0] : value}
          busy={busy}
          presets={STYLES}
          presetLabel="Design style"
          models={MODELS}
          ideas={IDEAS}
          onListeningChange={noop}
        />
      </div>
    </div>
  )
}

function noop() {}

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
