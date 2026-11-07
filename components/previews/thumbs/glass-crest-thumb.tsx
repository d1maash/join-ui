"use client"

import * as React from "react"

import {
  CrestAction,
  CrestQuiet,
  GlassCrest,
  type GlassCrestMark,
} from "@/registry/components/glass-crest"

/*
 * The product shot: the arc of glass assembling over its headline, apex first,
 * and then holding still — the crest only ever moves when it is touched, and a
 * thumbnail is never touched. Under reduced motion it is simply there. Laid out
 * at one fixed size and scaled to the tile.
 */
const SCENE = { width: 520, height: 380 }

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  )
}

const MARKS: GlassCrestMark[] = [
  {
    id: "prism",
    label: "Prism",
    accent: "oklch(0.66 0.21 10)",
    icon: (
      <Glyph>
        <path d="M12 1.5 19.2 12 12 16.2 4.8 12z" />
        <path d="M12 17.7 19.2 13.5 12 22.5 4.8 13.5z" opacity={0.72} />
      </Glyph>
    ),
  },
  {
    id: "tessera",
    label: "Tessera",
    accent: "oklch(0.74 0.17 55)",
    icon: (
      <Glyph>
        <path d="M4 3h16v3.6h-6.1V21h-3.8V6.6H4z" />
        <path d="M6.6 9.4h10.8V13H6.6z" opacity={0.72} />
      </Glyph>
    ),
  },
  {
    id: "obol",
    label: "Obol",
    accent: "oklch(0.79 0.16 80)",
    icon: (
      <Glyph>
        <path d="M10 1.5h2.3v3H10zM13.7 1.5H16v3h-2.3zM10 19.5h2.3v3H10zM13.7 19.5H16v3h-2.3z" />
        <path d="M6.4 4h7.2c2.9 0 4.7 1.4 4.7 3.7 0 1.5-.8 2.6-2.1 3.2 1.7.5 2.8 1.8 2.8 3.6 0 2.6-2 4.5-5.2 4.5H6.4zm3.6 3v3.1h3.1c1.1 0 1.8-.6 1.8-1.6S14.2 7 13.1 7zm0 5.8V16h3.5c1.2 0 2-.6 2-1.6s-.8-1.6-2-1.6z" />
      </Glyph>
    ),
  },
  {
    id: "helix",
    label: "Helix",
    accent: "oklch(0.72 0.18 150)",
    icon: (
      <Glyph>
        <path d="M12 1.6 20.6 6.8v10.4L12 22.4 3.4 17.2V6.8z" />
        <path d="M12 6.4 16.6 9.2v5.6L12 17.6 7.4 14.8V9.2z" opacity={0.55} />
      </Glyph>
    ),
  },
  {
    id: "cadence",
    label: "Cadence",
    accent: "oklch(0.7 0.12 215)",
    icon: (
      <Glyph>
        <path d="M3.6 3.4h4.1L12 8.1l4.3-4.7h4.1L14 10.5a2.8 2.8 0 0 1-4 0z" />
        <path d="M3.6 20.6h4.1L12 15.9l4.3 4.7h4.1L14 13.5a2.8 2.8 0 0 0-4 0z" opacity={0.72} />
      </Glyph>
    ),
  },
  {
    id: "sterling",
    label: "Sterling",
    accent: "oklch(0.6 0.2 256)",
    icon: (
      <Glyph>
        <path d="M9.4 2.4h4.2l-2.4 8.9 5.3-1.6-.8 3-5.3 1.6-1 3.8h9v3.5H4.6l1.9-7.1-2.6.8.8-3 2.6-.8z" />
      </Glyph>
    ),
  },
  {
    id: "azimuth",
    label: "Azimuth",
    accent: "oklch(0.56 0.2 290)",
    icon: (
      <Glyph>
        <path d="M6.6 4.6h13.8l-3.4 3.6H3.2z" />
        <path d="M3.2 10.2h13.8l3.4 3.6H6.6z" opacity={0.72} />
        <path d="M6.6 15.8h13.8l-3.4 3.6H3.2z" opacity={0.5} />
      </Glyph>
    ),
  },
]

export default function GlassCrestThumb() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)

  return (
    <div ref={frame} className="relative size-full overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: SCENE.width,
          height: SCENE.height,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        <GlassCrest
          size="sm"
          marks={MARKS}
          spread={140}
          overlap={0.32}
          labels="none"
          headingLevel={3}
          crestLabel="Supported assets"
          className="max-w-[26rem]"
          headline={
            <>
              A simple <CrestQuiet>approach to the complex</CrestQuiet> world
            </>
          }
          actions={
            <CrestAction tabIndex={-1} className="h-10 px-5 text-[0.9375rem]">
              Learn more
            </CrestAction>
          }
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
