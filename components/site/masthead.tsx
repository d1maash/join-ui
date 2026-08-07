import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A 20px-wide WebP of the same frame, inlined.
 *
 * The masthead is the first thing on the page and the file behind it is 95 KB,
 * so there is a paint or two where the headline would otherwise arrive over
 * bare page colour and then get swapped onto a near-black photograph. Twenty
 * pixels is enough to hold the tone through that.
 */
const RIDGE_PLACEHOLDER =
  "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAwCdASoUAAsAPu1krU6ppaSiMAgBMB2JaQAAW9b2ZvreDbx1PgAA/uE0n9I1N1XIy8/15Idu338MWG7haoIIZYwu9KS5iBduste+LDFAAA=="

export interface MastheadFact {
  label: string
  value: string
}

export interface MastheadProps {
  eyebrow: string
  facts: MastheadFact[]
}

/**
 * Photographic masthead.
 *
 * The chrome renders dark-only, so the primary button and the focus ring
 * already resolve to something that reads on a photograph and are left on the
 * design system's tokens. Only the pieces that sit directly on the picture —
 * the chip, the rules, the secondary button's glass — are written as explicit
 * whites, because those are keyed to the frame's own highlight rather than to
 * the page, and they must not move if the chrome's ink ever does.
 */
export function Masthead({ eyebrow, facts }: MastheadProps) {
  return (
    <section className="ridge relative isolate overflow-hidden border-b border-border">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/hero-ridge.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={RIDGE_PLACEHOLDER}
          /*
           * The frame is 16:9 and the band is wider than that at every
           * breakpoint above `sm`, so `cover` crops vertically and barely at
           * all — centred is the whole photograph.
           *
           * A phone crops the other way, hard, and the middle of this frame is
           * its emptiest part: centred, the band comes out a smooth grey wash
           * with the ridge pushed off the right edge. Sliding the window across
           * to the high shoulder puts the silhouette and the coarse screen back
           * on screen, which is the only reason the picture is here.
           */
          className="object-cover object-[72%_46%] sm:object-center"
        />
        <div className="ridge-grade absolute inset-0" />
      </div>

      <div className="relative flex min-h-[34rem] flex-col justify-end sm:min-h-[38rem] lg:min-h-[min(90svh,46rem)]">
        <div className="mx-auto w-full max-w-[100rem] px-4 pt-28 pb-12 sm:px-6 lg:pt-40 lg:pb-16">
          <p className="label-micro inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white/85 backdrop-blur-md">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-white/70"
            />
            {eyebrow}
          </p>

          {/*
            The flat-page headline is held to ~4rem, because past that a shape
            that dark stops being type and starts being weight. Reversed out of
            a photograph that ceiling does not apply — the mass is the picture's
            already, and the white letterforms are what lift off it.
          */}
          <h1 className="ridge-type mt-7 max-w-[15ch] text-[clamp(2.75rem,6.4vw,5rem)] leading-[1.01] font-semibold tracking-[-0.042em] text-white text-balance">
            Components
            <br />
            you actually own
          </h1>

          <p className="ridge-type mt-6 max-w-[54ch] text-[1.0625rem] leading-relaxed text-pretty text-white/75">
            Accessible, animated React components for Next.js. Install them with
            the shadcn CLI, copy the source, or hand the generated prompt to your
            coding agent.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
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
              className="border-white/25 bg-white/10 text-white backdrop-blur-md hover:border-white/45 hover:bg-white/20 hover:text-white"
            >
              <Link href="/docs/installation">Get started</Link>
            </Button>
          </div>
        </div>

        {/*
          The figures ride the bottom edge of the photograph rather than
          occupying a band of their own below it. Four short facts are not worth
          a section, and down here they double as the rule that closes the
          frame.
        */}
        <dl className="mx-auto grid w-full max-w-[100rem] grid-cols-2 gap-x-6 border-t border-white/15 px-4 sm:grid-cols-4 sm:px-6">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={cn(
                "py-5",
                index > 0 && "sm:border-l sm:border-white/15 sm:pl-6"
              )}
            >
              <dt className="label-micro text-white/60">{fact.label}</dt>
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
