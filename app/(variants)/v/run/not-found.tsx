import type { Metadata } from "next"

import { FailedRun } from "@/components/variants/run/failed-run"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

export default function RunNotFound() {
  return (
    <main
      id="main-content"
      className="run-container flex min-h-[calc(100dvh-8rem)] items-center pt-28 pb-16"
    >
      <div className="w-full">
        <FailedRun />
      </div>
    </main>
  )
}
