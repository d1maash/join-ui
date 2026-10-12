"use client"

import * as React from "react"

/**
 * What a thumbnail is allowed to do right now.
 *
 * At rest a thumbnail is a still drawing of its component. `playing` is the
 * card being pointed at or focused — or, on a screen with no pointer to hover
 * with, being on screen — and is never true under reduced motion. `session`
 * counts the times it has started playing, so a thumbnail can begin each one
 * from the top.
 */
export interface ThumbnailState {
  playing: boolean
  session: number
}

const ThumbnailContext = React.createContext<ThumbnailState>({ playing: false, session: 0 })

export const ThumbnailProvider = ThumbnailContext.Provider

export function useThumbnail(): ThumbnailState {
  return React.useContext(ThumbnailContext)
}

/**
 * A script for a thumbnail, as a list of beats.
 *
 * Each beat lasts as long as its entry in `durations`; after the last the
 * script starts again and `take` goes up by one. Returns `null` at rest, so
 * the thumbnail draws its resting frame, and starts every session from the
 * first beat — the clock is stamped with the session it belongs to, and one
 * left over from the last hover simply reads as not started.
 *
 * `durations` must be a module constant: a fresh array every render would
 * restart the beat it is in.
 */
export function useBeats(durations: readonly number[]) {
  const { playing, session } = useThumbnail()
  const [clock, setClock] = React.useState({ session, beat: 0, take: 0 })
  const { beat, take } = clock.session === session ? clock : { beat: 0, take: 0 }

  React.useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(
      () =>
        setClock(
          beat + 1 < durations.length
            ? { session, beat: beat + 1, take }
            : { session, beat: 0, take: take + 1 }
        ),
      durations[beat] ?? 0
    )
    return () => window.clearTimeout(timer)
  }, [playing, session, beat, take, durations])

  return playing ? { beat, take } : null
}
