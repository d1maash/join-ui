import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { MASTHEAD_ID } from "@/components/site/header-shell"
import { MastheadDrift } from "@/components/site/masthead-drift"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MastheadFact {
  label: string
  value: string
}

export interface MastheadProps {
  eyebrow: string
  facts: MastheadFact[]
}

/**
 * The masthead.
 *
 * A black plate with a ring field drawn on it, and the page's one piece of
 * display type set in the middle of it. The composition is centred, which is a
 * decision worth stating because the rest of this site is not: every section
 * below runs a label down a left rail with its content beside it, and the
 * masthead deliberately does not join in. It is the only band on the page with
 * nothing to reference and nothing to scan — one line, one sentence, two ways
 * in — so it is set the way a title page is rather than the way a document is.
 *
 * The chrome renders dark-only, so the primary button and the focus ring
 * already resolve to something that reads on black and are left on the design
 * system's tokens. Only the pieces that sit directly on the plate — the
 * eyebrow's rules, the corner marks, the secondary button's glass, the hairline
 * under the figures — are written as explicit whites, because those are keyed
 * to the plate's own highlight rather than to the page, and they must not move
 * if the chrome's ink ever does.
 */
export function Masthead({ eyebrow, facts }: MastheadProps) {
  return (
    /*
     * The negative margin cancels the bar's own height so the plate starts at
     * the top of the document and the nav sits on the picture rather than on a
     * strip of its own. `HeaderShell` finds this section by id and goes clear
     * for it.
     *
     * `3.5rem + 1px`, not `3.5rem`: the bar is a 56px row plus a hairline it
     * keeps in both states — transparent while clear — so that flipping to the
     * solid background cannot shift the page by a pixel. That hairline is part
     * of its height, and pulling up by only the row leaves a thread of page
     * colour above the plate.
     *
     * No bottom border. The grade's second pass already carries the band into
     * the page colour over the last 15rem, and a hairline drawn across the end
     * of a fade is a seam announcing a join that is not there.
     */
    <section
      id={MASTHEAD_ID}
      className="masthead relative isolate -mt-[calc(3.5rem+1px)] overflow-hidden bg-[rgb(var(--masthead-void))]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <MastheadDrift>
          {/*
            Hand-written `<picture>` rather than `next/image`, for one reason:
            this is an art-directed pair, and the optimiser has no `media`. Two
            `next/image`s toggled with `hidden` would have both files fetched on
            every load — `display: none` does not stop a request — and a single
            wide plate letterboxed onto a phone throws away the geometry the
            picture exists for. There is nothing else to buy back: the files are
            already WebP, already sized, and the largest of them is 38 KB.

            In the markup rather than behind an effect, so the preload scanner
            finds it in the first packet; `fetchPriority` puts it ahead of the
            font, since the plate is the whole of the first paint and the type
            arrives over it either way.
          */}
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet="/hero-orbit-mobile-750.webp 750w, /hero-orbit-mobile-1290.webp 1290w"
              sizes="100vw"
            />
            <source
              srcSet="/hero-orbit-1920.webp 1920w, /hero-orbit-2880.webp 2880w, /hero-orbit-3840.webp 3840w"
              sizes="100vw"
            />
            <img
              src="/hero-orbit-1920.webp"
              alt=""
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </picture>
        </MastheadDrift>

        {/* Outside the drift: both are anchored to the layout, not the plate. */}
        <div className="masthead-grade absolute inset-0" />
        <div className="masthead-grain absolute inset-0" />
      </div>

      {/*
        Corner marks. Four hairline brackets set inside the band's edges, which
        is the oldest trick there is for making a full-bleed picture read as a
        frame rather than as a wall. They are held to `lg` — at phone widths the
        band is barely wider than the copy and the marks land close enough to
        the type to look like a border on it.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 hidden lg:block"
      >
        <span className="absolute top-0 left-0 size-3.5 border-t border-l border-white/20" />
        <span className="absolute top-0 right-0 size-3.5 border-t border-r border-white/20" />
        <span className="absolute bottom-0 left-0 size-3.5 border-b border-l border-white/20" />
        <span className="absolute right-0 bottom-0 size-3.5 border-r border-b border-white/20" />
      </div>

      <div className="relative flex min-h-[38rem] flex-col sm:min-h-[42rem] lg:min-h-[min(100svh,52rem)]">
        <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col items-center justify-center px-4 pt-32 pb-14 text-center sm:px-6 lg:pt-36 lg:pb-20">
          {/*
            The eyebrow is a line, not a chip. A pill with a dot in it is the
            single most over-used object on a dark landing page, and it puts a
            filled shape directly above the one place on this site where the
            type is supposed to be the only thing happening. Rules either side
            do the same job — this is an annotation, read it first — without
            drawing a second object.
          */}
          <p className="flex w-full max-w-[34rem] items-center gap-4 text-white/45">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-transparent to-white/25"
            />
            <span className="label-micro">{eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-l from-transparent to-white/25"
            />
          </p>

          {/*
            Held to ~5.5rem and to a 13-character measure, so the line breaks
            where it is written to break rather than wherever the viewport puts
            it. Centred display type that rewraps on its own reads as an
            accident every time it lands on a width nobody checked.
          */}
          <h1 className="masthead-type mt-8 max-w-[13ch] text-[clamp(2.875rem,7vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-white text-balance">
            Components you actually own
          </h1>

          <p className="masthead-type mt-7 max-w-[52ch] text-[1.0625rem] leading-relaxed text-pretty text-white/60">
            Accessible, animated React components for Next.js. Install them with
            the shadcn CLI, copy the source, or hand the generated prompt to your
            coding agent.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/components">
                Browse components
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Link href="/docs/installation">Get started</Link>
            </Button>
          </div>
        </div>

        {/*
          The figures ride the bottom edge of the plate rather than occupying a
          band of their own below it. Four short facts are not worth a section,
          and down here they double as the rule that closes the frame.
        */}
        <dl className="mx-auto grid w-full max-w-[100rem] grid-cols-2 gap-x-6 border-t border-white/10 px-4 sm:grid-cols-4 sm:px-6">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "py-5 text-center",
                index > 0 && "sm:border-l sm:border-white/10"
              )}
            >
              <dt className="label-micro text-white/45">{fact.label}</dt>
              <dd className="numeral mt-1 text-2xl font-semibold text-white">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
