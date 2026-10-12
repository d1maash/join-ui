import { Boxes, Compass, Layers, PenTool, Shapes, Sparkles, Waves } from "lucide-react"

import type { FocusStackItem } from "@/registry/components/focus-stack"

export const SYSTEM: FocusStackItem[] = [
  {
    id: "asset-library",
    label: "Asset Library",
    description: "Every mark, icon and photograph in one place.",
    icon: <Boxes />,
    accent: "oklch(0.72 0.19 350)",
  },
  {
    id: "design-language",
    label: "Design Language",
    description: "The rules the whole product is written in.",
    icon: <Compass />,
    accent: "oklch(0.55 0.22 275)",
  },
  {
    id: "art-direction",
    label: "Art Direction",
    description: "How a page is meant to feel before it is read.",
    icon: <PenTool />,
    accent: "oklch(0.68 0.19 42)",
  },
  {
    id: "ui-architecture",
    label: "UI Architecture",
    description: "Layout, hierarchy and the shape of a screen.",
    icon: <Layers />,
    accent: "oklch(0.58 0.26 305)",
  },
  {
    id: "visual-modules",
    label: "Visual Modules",
    description: "Blocks that assemble into a page in any order.",
    icon: <Shapes />,
    accent: "oklch(0.82 0.16 88)",
  },
  {
    id: "motion-system",
    label: "Motion System",
    description: "Duration, easing and what earns an animation.",
    icon: <Waves />,
    accent: "oklch(0.65 0.2 22)",
  },
  {
    id: "brand-framework",
    label: "Brand Framework",
    description: "The voice everything above has to speak in.",
    icon: <Sparkles />,
    accent: "oklch(0.78 0.14 158)",
  },
]
