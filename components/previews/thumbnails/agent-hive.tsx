"use client"

import { AgentHive, type AgentHiveRun } from "@/registry/components/agent-hive"
import { MODELS, PROMPTS } from "@/components/previews/fixtures/agent-hive"

import { useBeats } from "./clock"

/*
 * A take is one request: the tile settles on a model, crosses to the next one,
 * and the action goes busy while the run is out.
 */
const BEATS = [600, 1400, 2400] as const

/* What the hive was last asked, so the queue below the comb is not empty. */
const HISTORY: AgentHiveRun[] = [
  { id: "history", prompt: PROMPTS[0]!, modelId: MODELS[0]!.id, state: "done" },
]

/**
 * At rest the tile sits on one model. A hover walks it on round the comb, one
 * model per take, and letting go sends it back home along the same glass.
 */
export default function AgentHiveThumbnail() {
  const clock = useBeats(BEATS)

  const take = clock?.take ?? 0
  const from = MODELS[(take + 1) % MODELS.length]!
  const to = MODELS[(take + 2) % MODELS.length]!

  return (
    <AgentHive
      label="Model"
      size="sm"
      variant="plain"
      comb={[2, 3, 2]}
      models={MODELS}
      value={clock && clock.beat > 0 ? to.id : from.id}
      busy={clock?.beat === 2}
      runs={HISTORY}
      maxRuns={1}
      className="w-full self-start"
    />
  )
}
