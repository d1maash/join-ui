import type * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { MASTHEAD_ID } from "@/components/site/header-shell"
import { MastheadTrail } from "@/components/site/masthead-trail"
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
 * Where an element stands in the band's arrival, in steps after the type's
 * cue. The stylesheet turns the number into a delay — `--place` times the
 * `--masthead-step` the band declares — so the order is written next to the
 * element it belongs to and the tempo is written once. See "How it arrives"
 * below.
 */
function place(step: number): React.CSSProperties {
  return { "--place": String(step) } as React.CSSProperties
}

/**
 * The masthead.
 *
 * A one-bit picture of a dust cloud in deep space, and the page's one piece of
 * display type hanging under it. The composition is centred, which is a
 * decision worth stating because the rest of this site is not: every section
 * below runs a label down a left rail with its content beside it, and the
 * masthead deliberately does not join in. It is the only band on the page with
 * nothing to reference and nothing to scan — two short lines, one sentence,
 * two ways in — so it is set the way a title page is rather than the way a
 * document is.
 *
 * The copy carries less than it used to on purpose. It used to name the
 * framework, the CLI, the source and the agent prompt in one breath, which is
 * four facts in a place that can hold about one; every one of them is stated
 * properly a screen further down, where it is being read rather than glanced
 * at. What is left says what the thing is and what happens to it, and stops.
 *
 * There is no eyebrow. One was written — the namespace and a five-word
 * description, set small above the headline — and it could not survive this
 * plate: at 12px it landed in the middle of the dot field and came out as
 * texture. Moving it above the cloud would have put it under the nav, and
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
 *
 * How it arrives
 * --------------
 * The band opens black, and the photograph gathers out of it — a long
 * exposure, which is what a picture of a nebula is: soft and dim at first,
 * then sharp, then full. It is held whole for a moment. Then the print is
 * pulled from it: the colour recedes and the one-bit plate rises in its
 * place, so the photograph is screened into dots in front of the reader. The
 * headline comes into focus while that is happening, and its letters are the
 * last place the picture lives — they hold the nebula's colour while the band
 * around them turns to print, and then they cool to ink. The sentence and the
 * buttons pull into focus under it; the rule at the foot of the band closes
 * the frame from the centre outward, and the four figures come up along it
 * from the middle out, because the composition is centred and so is its
 * arrival. About three and a half seconds, and every part of it is made of
 * the band's own materials — the photograph, the print, and the lens between
 * them — so nothing in it could be lifted onto another site.
 *
 * Every element carries its place in that order as `--place` and nothing
 * else; the tempo — the exposure, the hold, the drain, the type's cue, the
 * gap between places — is declared once on `.masthead` in the stylesheet,
 * which is also where the movements themselves are defined and where every
 * one of them is switched off for anyone who has asked for less. Nothing here
 * runs on the client: the arrival is CSS, it is under way before React has
 * hydrated, and it plays again on a client-side navigation back to this page.
 * The weather waits for it — `MastheadWind` holds its first gust off the band
 * until the print has settled, so the opening is never contradicted by a
 * gust of the colour it is in the middle of taking away.
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
          What the reader disturbs. The gust knows nothing about the pointer;
          this does, and it settles downwind at roughly the gust's speed so the
          two read as one system rather than as two effects sharing a band.
        */}
        <MastheadTrail />

        {/*
          The opening: the photograph, exposed out of the black and then
          screened into the print. Its own copy of the colour plate, because
          the gust's is only rendered once the client knows it may move, and
          this has to be in the first HTML. Under the grade, so the floor keeps
          the picture's colour out of the copy exactly as it keeps the dust out.
        */}
        <div className="masthead-opening">
          <Plate colour opening />
        </div>

        {/*
          Last, so it grades the colour as well as the mono. The floor is meant
          to keep the picture out of the copy, and a gust that could bring the
          dust back through it in full colour would be a hole in exactly the
          place the floor exists to protect.
        */}
        <div className="masthead-grade absolute inset-0" />
      </div>

      {/*
        The band is the first screen, exactly. Its top is the top of the
        document — the negative margin above puts the nav on the picture — and
        `100svh` takes it to the bottom of the viewport, so on arrival there is
        nothing on screen but the plate, the type and the four figures closing
        the frame along the bottom edge; the document begins under them. The
        small viewport unit, not the dynamic one: on a phone the band is sized
        to the screen with the browser's bars showing, which is the state it is
        first seen in, and it does not resize as they retract.

        `min-height`, so a short landscape window grows the band to fit the
        copy rather than stacking it into the dust.

        The copy hangs from the bottom of the band rather than sitting in the
        middle of it, and that is the plate's decision rather than a taste one.
        The dust runs across the top third and thins as it falls; anything
        centred in the band lands in the middle of it. Bottom-aligned, the
        headline crosses only the cloud's trailing edge — near enough that the
        type sits inside the picture rather than under it, far enough that the
        pattern is never behind more than the first line's ascenders, and the
        sentence and the buttons stay on plain black.
      */}
      <div className="relative flex min-h-svh flex-col">
        <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col items-center justify-end px-4 pt-40 pb-12 text-center sm:px-6 lg:pb-10">
          {/*
            Two sentences, and the break between them is written rather than
            left to the viewport. `max-w` was doing that job before, back when
            the line was one clause and could be squeezed until it folded in the
            right place; two sentences of almost identical length have exactly
            one correct break and no width can be trusted to find it. Centred
            display type that rewraps on its own reads as an accident every time
            it lands on a size nobody checked.
          */}
          {/*
            The lines are blocks rather than a `<br />` so that each is its own
            element and can be brought into focus on its own, the second a step
            behind the first — and so that each can carry the picture in its
            letters while the band is turning to print, which is a fill clipped
            to the glyphs and has to sit on the element that owns them.
          */}
          <h1 className="masthead-type text-[clamp(2.75rem,6.4vw,5rem)] leading-[1] font-semibold tracking-[-0.042em] text-white">
            <span className="masthead-title block" style={place(0)}>
              <span className="masthead-title-fill">Copy the code.</span>
            </span>
            <span className="masthead-title block" style={place(1)}>
              <span className="masthead-title-fill">Keep the code.</span>
            </span>
          </h1>

          <p
            className="masthead-type masthead-focus mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-pretty text-white/60"
            style={place(3.5)}
          >
            Animated React components that install into your repo and stay
            there.
          </p>

          <div
            className="masthead-focus mt-10 flex flex-wrap items-center justify-center gap-3"
            style={place(4.5)}
          >
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

          That rule is `.masthead-facts`' own pseudo-element rather than a
          border, because it is drawn out from the centre when the band arrives
          and a border cannot be scaled. The figures come up after it, the
          inner pair and then the outer, and travel less than the type above
          them did — they are a footing, not a headline.
        */}
        <dl className="masthead-facts mx-auto grid w-full max-w-[100rem] grid-cols-2 gap-x-6 px-4 sm:grid-cols-4 sm:px-6">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "masthead-focus py-5 text-center",
                index > 0 && "sm:border-l sm:border-white/10"
              )}
              /*
               * From the middle out: a figure's place is its distance from the
               * centre of the row, so the two inner cells share the first step
               * and the two outer cells the second. The rule is drawn from the
               * same centre, and the figures follow it.
               */
              style={place(6.5 + Math.floor(Math.abs(index - (facts.length - 1) / 2)))}
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

/** A 1×1 transparent GIF. What the opening's `<img>` shows when no source matches. */
const CLEAR_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

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
 * The mono print carries the resting band, so it gets `fetchPriority="high"` —
 * ahead of the font, since the type arrives over it either way. The colour
 * print in the gust is a reward that nothing is waiting on, so it goes out at
 * low priority and is only rendered at all once the client has established
 * that this device can show it moving.
 *
 * The opening's copy of the colour print is the exception on both counts: it
 * is the first thing seen, so it is fetched high, and it is in the first HTML
 * for everyone — including readers who have asked for less motion and will
 * never see it. For them it must not cost a request either, and `display:
 * none` does not stop one. So its sources carry the motion query in their
 * `media`, and the fallback `<img>` is a transparent pixel: with the
 * preference set no source matches, the pixel is what the element shows, and
 * the photograph is never asked for.
 */
function Plate({
  colour = false,
  opening = false,
}: {
  colour?: boolean
  /** The copy the band opens on: fetched first, and gated on motion being allowed. */
  opening?: boolean
}) {
  const stem = colour ? "hero-colour" : "hero-dither"
  const motion = opening ? " and (prefers-reduced-motion: no-preference)" : ""

  return (
    <picture>
      <source
        media={`(max-width: 639px)${motion}`}
        srcSet={`/${stem}-mobile-860.webp 860w, /${stem}-mobile-1290.webp 1290w`}
        sizes="100vw"
      />
      <source
        media={opening ? "(prefers-reduced-motion: no-preference)" : undefined}
        srcSet={
          colour
            ? "/hero-colour-1280.webp 1280w, /hero-colour-1920.webp 1920w"
            : "/hero-dither-1920.webp 1920w, /hero-dither-2880.webp 2880w, /hero-dither-3840.webp 3840w"
        }
        sizes="100vw"
      />
      <img
        src={
          opening
            ? CLEAR_PIXEL
            : colour
              ? "/hero-colour-1280.webp"
              : "/hero-dither-1920.webp"
        }
        alt=""
        fetchPriority={colour && !opening ? "low" : "high"}
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
