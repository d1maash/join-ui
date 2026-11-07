import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PlateFigure } from "@/components/variants/specimen/plate-figure"
import { href } from "@/components/variants/specimen/plates"

export const metadata: Metadata = {
  title: "Plate missing",
  robots: { index: false, follow: false },
}

/*
 * The missing plate: a drafting board with nothing on it, its crop marks in
 * place, and one callout pointing at the outline of the part that was never
 * printed.
 */
export default function PlateMissing() {
  return (
    <main id="main-content" className="sp-wrap pt-8 lg:pt-12">
      <div className="flex items-baseline justify-between border-t border-[var(--sp-ink)] pt-3">
        <p className="sp-label !text-[var(--sp-ink)]">Plate missing</p>
        <p className="sp-label">Error 404</p>
      </div>

      <div className="sp-grid mt-8 items-end gap-y-6">
        <h1 className="sp-display col-span-4 text-[clamp(56px,9vw,132px)] leading-[0.88] lg:col-span-8">
          This page was never printed.
        </h1>
        <p className="col-span-4 text-[17px] leading-[1.55] text-[var(--sp-ink-2)] lg:col-span-4">
          The address points at a plate the manual does not have. It may have been renamed,
          or the link was mistyped.
        </p>
      </div>

      <PlateFigure
        className="mt-14"
        fig="FIG. 00"
        note="Blank"
        autoplay={false}
        stageClassName="min-h-[440px]"
        callouts={[
          {
            key: "A",
            title: "Nothing printed here",
            note: "Where the part would be. The board, the marks and the grid survived; the drawing did not.",
            spec: "404",
            at: { sel: "[data-void]", x: 1, y: 0.5, box: true, pad: 0 },
          },
        ]}
      >
        <div
          data-void=""
          aria-hidden="true"
          className="h-[240px] w-full max-w-[420px] border border-dashed border-[var(--sp-rule-strong)]"
        />
      </PlateFigure>

      <nav aria-label="Ways back" className="mt-12 grid border-y border-[var(--sp-ink)] sm:grid-cols-3">
        {[
          { label: "Contents", hint: "Back to the cover", target: href("/") + "#contents" },
          { label: "Index of plates", hint: "Every plate, filed", target: href("/components") },
          { label: "The manual", hint: "Install, set up, theme", target: href("/docs") },
        ].map((link, index) => (
          <Link
            key={link.label}
            href={link.target}
            className={
              "group flex items-end justify-between gap-4 py-6 " +
              (index > 0 ? "border-t border-[var(--sp-rule)] sm:border-t-0 sm:border-l sm:pl-6" : "sm:pr-6")
            }
          >
            <span>
              <span className="sp-label block">{link.hint}</span>
              <span className="sp-display mt-2 block text-[32px] leading-none">{link.label}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </nav>
    </main>
  )
}
