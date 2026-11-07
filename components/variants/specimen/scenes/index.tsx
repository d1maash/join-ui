"use client"

import type * as React from "react"
import dynamic from "next/dynamic"

import { ANATOMY } from "../anatomy"
import { PlateFigure, type PlateFigureProps } from "../plate-figure"

/*
 * One scene per plate, loaded on demand, so a page only downloads the
 * components it actually draws.
 */
const SCENES: Record<string, React.ComponentType> = {
  "agent-hive": dynamic(() => import("./agent-hive")),
  "approval-gate": dynamic(() => import("./approval-gate")),
  "carbon-copy": dynamic(() => import("./carbon-copy")),
  "focus-stack": dynamic(() => import("./focus-stack")),
  "glass-crest": dynamic(() => import("./glass-crest")),
  "status-timeline": dynamic(() => import("./status-timeline")),
  "tool-trace": dynamic(() => import("./tool-trace")),
}

export function hasScene(slug: string) {
  return slug in SCENES
}

type SpecimenPlateProps = Omit<PlateFigureProps, "callouts" | "children"> & {
  slug: string
}

/** A plate: the scene for `slug`, on a board, with its anatomy lettered. */
export function SpecimenPlate({ slug, layout, ...props }: SpecimenPlateProps) {
  const Scene = SCENES[slug]
  const anatomy = ANATOMY[slug]
  if (!Scene || !anatomy) return null
  return (
    <PlateFigure
      callouts={anatomy.callouts}
      layout={layout ?? anatomy.layout}
      legendSlots={anatomy.legendSlots}
      {...props}
    >
      <Scene />
    </PlateFigure>
  )
}
