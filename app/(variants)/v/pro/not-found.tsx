import Link from "next/link"

import { proHref } from "@/components/variants/pro/href"
import { pillClass, textLinkClass, type } from "@/components/variants/pro/styles"
import { cn } from "@/lib/utils"

export default function ProNotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32 text-center"
    >
      <p className={cn(type.eyebrow, "text-[#86868b]")}>404</p>
      <h1 className={cn(type.display, "mt-2 text-[#f5f5f7]")}>
        Nothing on this stage.
      </h1>
      <p className={cn(type.intro, "mt-5 max-w-[32rem] text-[#86868b]")}>
        The page you were after has moved, or never existed.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        <Link href={proHref("/components")} className={pillClass("primary")}>
          Browse components
        </Link>
        <Link href={proHref("/")} className={cn(textLinkClass, "text-[17px]")}>
          Back to the start
          <span aria-hidden="true" className="ml-0.5">
            ›
          </span>
        </Link>
      </div>
    </main>
  )
}
