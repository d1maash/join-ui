"use client"

import * as React from "react"

/**
 * What a thumbnail is allowed to do right now.
 *
 * `live` is the card being on screen with motion allowed — the family's rule
 * for anything that runs on its own is that it holds while nobody can see it.
 * `still` is a reduced-motion setting: the thumbnail parks on one frame that
 * says what the component is, and never moves off it.
 */
export interface ThumbnailState {
  live: boolean
  still: boolean
}

const ThumbnailContext = React.createContext<ThumbnailState>({ live: false, still: false })

export const ThumbnailProvider = ThumbnailContext.Provider

export function useThumbnail(): ThumbnailState {
  return React.useContext(ThumbnailContext)
}

/**
 * A script for a thumbnail, as a list of beats.
 *
 * Each beat lasts as long as its entry in `durations`; after the last the
 * script starts again and `take` goes up by one, which a thumbnail can key a
 * remount on when the component it shows has no way to play twice. The clock
 * only runs while the card is live, so a thumbnail scrolled away resumes on the
 * beat it left rather than having played to itself in the meantime.
 *
 * `durations` must be a module constant: a fresh array every render would
 * restart the beat it is in.
 */
export function useBeats(durations: readonly number[], poster = 0) {
  const { live, still } = useThumbnail()
  const [clock, setClock] = React.useState({ beat: 0, take: 0 })

  React.useEffect(() => {
    if (!live) return
    const timer = window.setTimeout(
      () =>
        setClock(({ beat, take }) =>
          beat + 1 < durations.length
            ? { beat: beat + 1, take }
            : { beat: 0, take: take + 1 }
        ),
      durations[clock.beat] ?? 0
    )
    return () => window.clearTimeout(timer)
  }, [live, clock, durations])

  return still ? { beat: poster, take: 0 } : clock
}
