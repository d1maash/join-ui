import {
  CaseSensitive,
  ChartNoAxesColumn,
  Compass,
  FlaskConical,
  GalleryVerticalEnd,
  Grid2x2,
  Image,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageSquareMore,
  MousePointerClick,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react"

import type { ComponentCategory } from "@/types/registry"

/** One glyph per category, for the Store-style icon row in the catalog. */
export const CATEGORY_ICONS: Record<ComponentCategory | "All", LucideIcon> = {
  All: Grid2x2,
  Buttons: MousePointerClick,
  Navigation: Compass,
  Cards: GalleryVerticalEnd,
  Forms: TextCursorInput,
  "Data Display": ChartNoAxesColumn,
  Feedback: MessageSquareMore,
  Overlays: Layers,
  "Text Effects": CaseSensitive,
  Backgrounds: Image,
  Layout: LayoutGrid,
  Marketing: Megaphone,
  Experimental: FlaskConical,
}
