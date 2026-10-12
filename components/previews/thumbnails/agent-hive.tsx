"use client"

import { AgentHive, type AgentHiveRun } from "@/registry/components/agent-hive"
import { MODELS, PROMPTS } from "@/components/previews/fixtures/agent-hive"

import { useBeats } from "./clock"

/*
 * A take is one request: the tile settles on a model, crosses to the next one,
 * the run is sent and types itself out, and then it lands.
 */
const BEATS = [1300, 1600, 2600, 1500] as const

export default function AgentHiveThumbnail() {
  const { beat, take } = useBeats(BEATS, 3)

  const from = MODELS[take % MODELS.length]!
  const to = MODELS[(take + 1) % MODELS.length]!

  /*
   * Derived from the clock rather than accumulated, so the queue is always the
   * run in hand and the one before it. A run is new to the hive the first beat
   * it appears in, which is what makes it type itself out.
   */
  const previous: AgentHiveRun = {
    id: `run-${take - 1}`,
    prompt: PROMPTS[(take + PROMPTS.length - 1) % PROMPTS.length]!,
    modelId: from.id,
    state: "done",
  }
  const current: AgentHiveRun = {
    id: `run-${take}`,
    prompt: PROMPTS[take % PROMPTS.length]!,
    modelId: to.id,
    state: beat === 3 ? "done" : "working",
  }

  return (
    <AgentHive
      label="Model"
      size="sm"
      variant="plain"
      comb={[2, 3, 2]}
      models={MODELS}
      value={beat === 0 ? from.id : to.id}
      runs={beat >= 2 ? [current, previous] : [previous]}
      maxRuns={1}
      className="w-full self-start"
    />
  )
}
