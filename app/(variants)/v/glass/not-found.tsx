import Link from "next/link"

import { g, pill } from "@/components/variants/glass/ui"

export default function GlassNotFound() {
  return (
    <main id="main-content" className="px-4 pt-40 sm:px-6">
      <div className="g-glass g-thin mx-auto flex max-w-[760px] flex-col items-center rounded-[40px] px-6 py-20 text-center">
        <p className="g-spectrum text-[21px] font-semibold tracking-[-0.02em]">404</p>
        <h1 className="mt-2 text-[clamp(2.5rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-[#1d1d1f]">
          This page drifted off.
        </h1>
        <p className="mt-4 max-w-[28rem] text-[19px] leading-[1.42] text-[#3a3a3e]">
          The link may be old, or the page may have moved. The catalog and the docs are
          where you left them.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={g("/components")} className={pill("primary", "lg")}>
            Browse components
          </Link>
          <Link href={g("/docs")} className={pill("glass", "lg")}>
            Read the docs
          </Link>
        </div>
      </div>
    </main>
  )
}
