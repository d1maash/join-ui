import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { MASTHEAD_ID } from "@/components/site/header-shell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MastheadFact {
  label: string
  value: string
}

export interface MastheadProps {
  facts: MastheadFact[]
}

/**
 * The masthead.
 *
 * A one-bit picture of two hands reaching for each other, and the page's one
 * piece of display type hanging under it. The composition is centred, which is
 * a decision worth stating because the rest of this site is not: every section
 * below runs a label down a left rail with its content beside it, and the
 * masthead deliberately does not join in. It is the only band on the page with
 * nothing to reference and nothing to scan — one line, one sentence, two ways
 * in — so it is set the way a title page is rather than the way a document is.
 *
 * There is no eyebrow. One was written — the namespace and a five-word
 * description, set small above the headline — and it could not survive this
 * plate: at 12px it landed in the middle of the dot field and came out as
 * texture. Moving it above the hands would have put it under the nav, and
 * moving it below the buttons would have made it a caption for nothing. The
 * same sentence already opens the Install section a screen further down, where
 * it is being read rather than looked at.
 *
 * The chrome renders dark-only, so the primary button and the focus ring
 * already resolve to something that reads on black and are left on the design
 * system's tokens. Only the pieces that sit directly on the plate — the
 * secondary button's glass, the hairline under the figures — are written as
 * explicit whites, because those are keyed to the plate's own white rather than
 * to the page, and they must not move if the chrome's ink ever does.
 */
export function Masthead({ facts }: MastheadProps) {
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
     * The plate runs black all the way to the bottom edge and the page starts
     * under a hairline, rather than the band fading into the page colour behind
     * the figures. See the note on `.masthead-grade`.
     */
    <section
      id={MASTHEAD_ID}
      className="masthead relative isolate -mt-[calc(3.5rem+1px)] overflow-hidden border-b border-border bg-[rgb(var(--masthead-void))]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        {/*
          Hand-written `<picture>` rather than `next/image`, for one reason:
          this is an art-directed pair, and the optimiser has no `media`. Two
          `next/image`s toggled with `hidden` would have both files fetched on
          every load — `display: none` does not stop a request — and a single
          wide plate letterboxed onto a phone throws away the composition the
          picture exists for. There is nothing else to buy back: the files are
          already WebP, already sized, and the largest of them is well under
          100 KB.

          `fetchPriority` puts it ahead of the font, since the plate is the
          whole of the first paint and the type arrives over it either way.

          The plate does not move. A pointer parallax was built for it and then
          taken out: this picture is one-bit, and a dither has no sub-pixel to
          translate into — every frame of a fractional transform resamples the
          dot grid into grey mush, which is the one thing a 1-bit image must
          never do. It is also, at this size, a full-screen repaint bought with
          nothing but a cursor.
        */}
        <picture>
          <source
            media="(max-width: 639px)"
            srcSet="/hero-dither-mobile-860.webp 860w, /hero-dither-mobile-1290.webp 1290w"
            sizes="100vw"
          />
          <source
            srcSet="/hero-dither-1920.webp 1920w, /hero-dither-2880.webp 2880w, /hero-dither-3840.webp 3840w"
            sizes="100vw"
          />
          <img
            src="/hero-dither-1920.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            /*
             * Anchored to the top, not centred. The plate is 16:9 and the band
             * is wider than that on a large monitor, so `cover` crops it
             * vertically — and a centred crop takes the same amount off the
             * top, which walks the forearms up under the nav until they are
             * running behind the logo. Every pixel the crop can take from the
             * bottom is black, so it takes it all from there instead.
             */
            className="masthead-plate absolute inset-0 size-full object-cover object-top"
          />
        </picture>

        <div className="masthead-grade absolute inset-0" />
      </div>

      {/*
        The copy hangs from the bottom of the band rather than sitting in the
        middle of it, and that is the plate's decision rather than a taste one.
        The hands come in across the top third and reach down toward the middle;
        anything centred in the band lands inside them. Bottom-aligned, the
        fingers stop just short of the headline — close enough that the type
        reads as the thing they are reaching for, far enough that the dot field
        is never behind more than the first line's ascenders.
      */}
      <div className="relative flex min-h-[54rem] flex-col lg:min-h-[min(100svh,52rem)]">
        <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col items-center justify-end px-4 pt-40 pb-12 text-center sm:px-6 lg:pb-10">
          {/*
            Held to 5rem and to a 13-character measure, so the line breaks where
            it is written to break rather than wherever the viewport puts it.
            Centred display type that rewraps on its own reads as an accident
            every time it lands on a width nobody checked.
          */}
          <h1 className="masthead-type max-w-[13ch] text-[clamp(2.75rem,6.4vw,5rem)] leading-[1] font-semibold tracking-[-0.042em] text-white text-balance">
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
