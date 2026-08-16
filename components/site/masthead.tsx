import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { MASTHEAD_ID } from "@/components/site/header-shell"
import { MastheadWind } from "@/components/site/masthead-wind"
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
 * A one-bit picture of a dust cloud in deep space, and the page's one piece of
 * display type hanging under it. The composition is centred, which is a
 * decision worth stating because the rest of this site is not: every section
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
     * No bottom border, and nothing fading into anything. The page's own
     * `--grey-0` was moved onto the plate's black, so the band and the document
     * under it are now literally the same colour — there is no join left to
     * draw. A hairline here would be a rule announcing an edge that does not
     * exist, and the figures' own top border is already closing the frame.
     */
    <section
      id={MASTHEAD_ID}
      className="masthead relative isolate -mt-[calc(3.5rem+1px)] overflow-hidden bg-[rgb(var(--masthead-void))]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        {/* The band as it rests: the nebula as a one-bit dither. */}
        <Plate />

        {/*
          The same photograph in colour, blown across the band in streaks. A
          different file, not a filter — there is no way to get from one bit per
          pixel back to a hue, so the colour has to arrive as its own print,
          registered against the mono one.
        */}
        <MastheadWind>
          <Plate colour />
        </MastheadWind>

        {/*
          Last, so it grades the colour as well as the mono. The floor is meant
          to keep the picture out of the copy, and a gust that could bring the
          dust back through it in full colour would be a hole in exactly the
          place the floor exists to protect.
        */}
        <div className="masthead-grade absolute inset-0" />
      </div>

      {/*
        The copy hangs from the bottom of the band rather than sitting in the
        middle of it, and that is the plate's decision rather than a taste one.
        The dust runs across the top third and thins as it falls; anything
        centred in the band lands in the middle of it. Bottom-aligned, the
        headline crosses only the cloud's trailing edge — near enough that the
        type sits inside the picture rather than under it, far enough that the
        pattern is never behind more than the first line's ascenders, and the
        sentence and the buttons stay on plain black.
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

/**
 * The plate, as markup, in either of its two prints.
 *
 * Hand-written `<picture>` rather than `next/image`, for one reason: each print
 * is an art-directed pair and the optimiser has no `media`. Two `next/image`s
 * toggled with `hidden` would have both files fetched on every load —
 * `display: none` does not stop a request — and a single wide plate letterboxed
 * onto a phone throws away the composition the picture exists for.
 *
 * The two prints are laid out identically and cropped identically, which is not
 * a coincidence and is not free: the colour source is cut with the same slice
 * off the top that the tall mono plate takes, because the loupe reveals one
 * directly over the other and a few pixels of drift between them would read as
 * a misregistered print rather than as the same photograph.
 *
 * The mono print carries the first paint, so it gets `fetchPriority="high"` —
 * ahead of the font, since the type arrives over it either way. The colour
 * print is a hover reward that nothing is waiting on, so it goes out at low
 * priority and is only rendered at all once `MastheadLoupe` has established
 * that this device has a pointer.
 */
function Plate({ colour = false }: { colour?: boolean }) {
  const stem = colour ? "hero-colour" : "hero-dither"

  return (
    <picture>
      <source
        media="(max-width: 639px)"
        srcSet={`/${stem}-mobile-860.webp 860w, /${stem}-mobile-1290.webp 1290w`}
        sizes="100vw"
      />
      <source
        srcSet={
          colour
            ? "/hero-colour-1280.webp 1280w, /hero-colour-1920.webp 1920w"
            : "/hero-dither-1920.webp 1920w, /hero-dither-2880.webp 2880w, /hero-dither-3840.webp 3840w"
        }
        sizes="100vw"
      />
      <img
        src={colour ? "/hero-colour-1280.webp" : "/hero-dither-1920.webp"}
        alt=""
        fetchPriority={colour ? "low" : "high"}
        decoding="async"
        /*
         * Anchored to the top, not centred. The plate is 16:9 and the band is
         * wider than that on a large monitor, so `cover` crops it vertically —
         * and a centred crop takes the same amount off the top, which walks the
         * dust up under the nav until it is running behind the logo. Every pixel
         * the crop can take from the bottom is black, so it takes it all from
         * there instead.
         */
        className={cn(
          "absolute inset-0 size-full object-cover object-top",
          colour ? "masthead-colour" : "masthead-plate"
        )}
      />
    </picture>
  )
}
