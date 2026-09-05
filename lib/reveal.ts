import type * as React from "react"

/**
 * Where an element stands in its band's entrance.
 *
 * The stylesheet turns the index into a delay — `--reveal-i` times the
 * `--reveal-step` the band declares — so the order is written next to the
 * element it belongs to, in the markup, and the tempo is written once. It is an
 * inline custom property rather than a class per position because the sequence
 * is data: a grid of cards numbers itself from its own index and a header from
 * the order its lines are read in, and neither should have to know how many
 * milliseconds that is.
 *
 * A plain module rather than part of `Reveal`, so a Server Component can call
 * it. Everything exported from a `"use client"` file is a reference the server
 * may render but not invoke.
 */
export function revealAt(index: number): React.CSSProperties {
  return { "--reveal-i": String(index) } as React.CSSProperties
}
