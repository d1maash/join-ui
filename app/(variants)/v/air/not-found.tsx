import { air } from "@/components/variants/air/href"
import { MoreLink, PillLink } from "@/components/variants/air/pill"

export default function AirNotFound() {
  return (
    <main id="main-content" className="bg-white px-5 pt-28 pb-36 text-center sm:pt-40">
      <p className="air-eyebrow text-[#6e6e73]">404</p>
      <h1 className="air-h1 mt-3 text-[#1d1d1f]">This page isn&rsquo;t here.</h1>
      <p className="air-sub mx-auto mt-5 max-w-[30ch] text-balance text-[#6e6e73]">
        It may have moved, or the address may be mistyped.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3.5">
        <PillLink href={air("/components")} size="lg">
          Browse components
        </PillLink>
        <PillLink href={air("/docs")} variant="secondary" size="lg">
          Read the docs
        </PillLink>
      </div>
      <p className="mt-7 text-[17px]">
        <MoreLink href={air("/")}>Back to Join UI</MoreLink>
      </p>
    </main>
  )
}
