"use client"

import * as React from "react"
import { Boxes, Compass, Layers, PenTool, Shapes, Sparkles, Waves } from "lucide-react"

import { FocusStack, type FocusStackItem } from "@/registry/components/focus-stack"

/*
 * The product shot: the coil turning on its own timer, the pill in the middle
 * lifted and lit by a breath of its own colour. Under reduced motion the stack
 * holds still on its own, so the frame below is already the finished picture.
 * Laid out at one fixed size and scaled to the tile.
 */
const SCENE = { width: 440, height: 330 }

const ITEMS: FocusStackItem[] = [
  {
    id: "asset-library",
    label: "Asset Library",
    description: "Every mark and photograph in one place.",
    icon: <Boxes />,
    accent: "oklch(0.65 0.22 12)",
  },
  {
    id: "design-language",
    label: "Design Language",
    description: "The rules the product is written in.",
    icon: <Compass />,
    accent: "oklch(0.55 0.19 280)",
  },
  {
    id: "art-direction",
    label: "Art Direction",
    description: "How a page should feel before it is read.",
    icon: <PenTool />,
    accent: "oklch(0.72 0.18 55)",
  },
  {
    id: "ui-architecture",
    label: "UI Architecture",
    description: "Layout, hierarchy and the shape of a screen.",
    icon: <Layers />,
    accent: "oklch(0.6 0.21 308)",
  },
  {
    id: "visual-modules",
    label: "Visual Modules",
    description: "Blocks that assemble in any order.",
    icon: <Shapes />,
    accent: "oklch(0.61 0.2 256)",
  },
  {
    id: "motion-system",
    label: "Motion System",
    description: "Duration, easing and what earns a move.",
    icon: <Waves />,
    accent: "oklch(0.64 0.22 28)",
  },
  {
    id: "brand-framework",
    label: "Brand Framework",
    description: "The voice everything has to speak in.",
    icon: <Sparkles />,
    accent: "oklch(0.7 0.17 152)",
  },
]

const START = 3

export default function FocusStackThumb() {
  const [frame, scale] = useFit(SCENE.width, SCENE.height)
  const [index, setIndex] = React.useState(START)

  return (
    <div ref={frame} className="relative size-full overflow-hidden">
      {/* A breath of the focused pill's colour, under the middle of the coil. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-[34%] w-[58%] -translate-1/2 rounded-full opacity-[0.14] blur-[44px] transition-[background-color] duration-700"
        style={{ backgroundColor: ITEMS[index]?.accent }}
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
        <FocusStack
          label="Design system"
          items={ITEMS}
          mode="auto"
          defaultIndex={START}
          onIndexChange={setIndex}
          interval={2200}
          depth={2}
          size="sm"
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
