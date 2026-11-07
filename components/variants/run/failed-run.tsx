"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { variantHref } from "@/lib/variants"
import { ToolTrace, type ToolTraceStep } from "@/registry/components/tool-trace"

import { WindowToolbar } from "./furniture"
import { setRunTone, TONE_COLOR } from "./state"
import { RunWindow } from "./window"

const href = (path: string) => variantHref("run", path)

/*
 * A 404, told the only way this site tells anything: as a run. The agent
 * matched no route, tried to open the page anyway, and the step failed — the
 * trace says where, and the way home is right under it.
 */
export function FailedRun() {
  const pathname = usePathname()
  const path = pathname || "/"

  React.useEffect(() => {
    setRunTone("failed")
    return () => setRunTone("idle")
  }, [])

  const steps: ToolTraceStep[] = [
    {
      id: "match",
      name: "match_route",
      summary: path,
      state: "done",
      meta: "2ms",
      output: ["checked 17 routes", "→ no match"],
    },
    {
      id: "open",
      name: "open_page",
      summary: path,
      state: "failed",
      meta: "404",
      output: [`404 — no page at ${path}`, "→ stopping the run"],
    },
    {
      id: "render",
      name: "render",
      summary: "page.tsx",
      state: "skipped",
      meta: "skipped",
    },
  ]

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
      <div className="flex flex-col gap-7">
        <p className="font-mono text-[12px] text-[#ff6961]">404</p>
        <h1 className="text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.022em]">
          This run failed.
        </h1>
        <p className="run-caption-text">
          <strong>Nothing lives at this address.</strong> The agent looked for{" "}
          <code className="font-mono text-[0.85em] break-all text-[#f5f5f7]">
            {path}
          </code>{" "}
          and stopped rather than guess.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href("/")} className="run-btn run-btn--primary">
            Back to the start
          </Link>
          <Link href={href("/components")} className="run-btn run-btn--ghost">
            Browse the seven
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="run-bloom"
          style={{ "--run-state": TONE_COLOR.failed } as React.CSSProperties}
        />
        <RunWindow
          label="The failed run"
          flat
          toolbar={<WindowToolbar title={`Open ${path}`} tone="failed" />}
        >
          <div className="px-5 pt-3 pb-5">
            <ToolTrace
              variant="plain"
              label="Run 149"
              steps={steps}
              defaultExpanded={["open"]}
              follow={false}
              className="w-full"
            />
          </div>
        </RunWindow>
      </div>
    </div>
  )
}
