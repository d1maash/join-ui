import type * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Printer's marks. Pure markup, so both server and client files can set them.
 */

/**
 * Crop marks just outside the corners of a sheet. Hidden below `lg`, where the
 * margin is too narrow to hold them without the page scrolling sideways.
 */
export function CropMarks({ gap = 10, length = 16 }: { gap?: number; length?: number }) {
  const out = -(gap + length)
  const marks: React.CSSProperties[] = [
    { left: out, top: 0, width: length, height: 1 },
    { left: 0, top: out, width: 1, height: length },
    { right: out, top: 0, width: length, height: 1 },
    { right: 0, top: out, width: 1, height: length },
    { left: out, bottom: 0, width: length, height: 1 },
    { left: 0, bottom: out, width: 1, height: length },
    { right: out, bottom: 0, width: length, height: 1 },
    { right: 0, bottom: out, width: 1, height: length },
  ]
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {marks.map((style, index) => (
        <span key={index} className="sp-crop" style={style} />
      ))}
    </span>
  )
}

/** A registration target centred on a point of its parent. */
export function RegMark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden="true" className={cn("sp-reg hidden lg:block", className)} style={style} />
}
