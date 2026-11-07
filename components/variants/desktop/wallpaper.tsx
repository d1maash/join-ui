"use client"

import { useOs } from "./os"

/*
 * The wallpaper is the project's own photograph — the nebula from the
 * original masthead — art-directed per device: the wide band for the Mac,
 * the tall crop for the phone. The one-bit print of the same picture is the
 * second wallpaper, chosen from the logo menu.
 */
export function Wallpaper() {
  const { wallpaper } = useOs()
  const dither = wallpaper === "dither"

  return (
    <div className="d-wall" aria-hidden="true">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={
            dither
              ? "/hero-dither-mobile-860.webp 860w, /hero-dither-mobile-1290.webp 1290w"
              : "/hero-colour-mobile-860.webp 860w, /hero-colour-mobile-1290.webp 1290w"
          }
          sizes="100vw"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed, art-directed backdrop; next/image would only add a wrapper */}
        <img
          src={dither ? "/hero-dither-1920.webp" : "/hero-colour-1920.webp"}
          srcSet={
            dither
              ? "/hero-dither-1920.webp 1920w, /hero-dither-2880.webp 2880w"
              : "/hero-colour-1280.webp 1280w, /hero-colour-1920.webp 1920w"
          }
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    </div>
  )
}
