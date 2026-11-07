"use client"

import * as React from "react"

import { MODELS, PROMPTS } from "@/components/previews/fixtures/agent-hive"
import {
  AgentHive,
  type AgentHiveModel,
  type AgentHiveRun,
} from "@/registry/components/agent-hive"

import { useReducedMotionPref } from "../plate-figure"

/*
 * Plate 01. The comb walks itself — a model is picked, a run is dispatched and
 * types itself into the queue, then lands — until the reader takes over by
 * picking a tile or pressing the action, and from then on it is theirs.
 */
const WALK = ["prism", "nimbus", "aster", "quartz"]
const BEAT = 3600

const SEED: AgentHiveRun[] = [
  {
    id: "seed",
    prompt: "Trace the failing checkout webhook back to its retry",
    modelId: "aster",
    state: "done",
  },
]

export default function AgentHiveScene() {
  const reduce = useReducedMotionPref()
  const [value, setValue] = React.useState("prism")
  const [runs, setRuns] = React.useState<AgentHiveRun[]>(SEED)
  const [owned, setOwned] = React.useState(false)
  const count = React.useRef(0)
  const timers = React.useRef<number[]>([])

  const dispatch = React.useCallback((model: AgentHiveModel | undefined) => {
    if (!model) return
    count.current += 1
    const id = `run-${count.current}`
    const prompt = PROMPTS[count.current % PROMPTS.length] ?? PROMPTS[0]!
    setRuns((current) =>
      [{ id, prompt, modelId: model.id, state: "working" as const }, ...current].slice(0, 3)
    )
    timers.current.push(
      window.setTimeout(() => {
        setRuns((current) =>
          current.map((run) => (run.id === id ? { ...run, state: "done" as const } : run))
        )
      }, 2600)
    )
  }, [])

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  React.useEffect(() => {
    if (reduce || owned) return
    let step = 0
    const loop = window.setInterval(() => {
      step += 1
      const id = WALK[step % WALK.length]!
      setValue(id)
      timers.current.push(
        window.setTimeout(() => dispatch(MODELS.find((model) => model.id === id)), 900)
      )
    }, BEAT)
    return () => window.clearInterval(loop)
  }, [reduce, owned, dispatch])

  return (
    <AgentHive
      label="Model"
      models={MODELS}
      value={value}
      onValueChange={(id) => {
        setOwned(true)
        setValue(id)
      }}
      runs={runs}
      maxRuns={3}
      onGenerate={(model) => {
        setOwned(true)
        dispatch(model)
      }}
      className="w-full max-w-[400px]"
    />
  )
}
