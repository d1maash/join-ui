"use client"

import * as React from "react"
import Link from "next/link"
import * as Tabs from "@radix-ui/react-tabs"
import { motion } from "motion/react"
import { Maximize2 } from "lucide-react"

import { renderPreview } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

import { Segmented } from "./segmented"
import { LENS_SPRING } from "./ui"

const VIEWS = [
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" },
  { value: "install", label: "Install" },
  { value: "prompt", label: "Prompt" },
] as const

type View = (typeof VIEWS)[number]["value"]

function isView(value: string): value is View {
  return VIEWS.some((view) => view.value === value)
}

/**
 * The component in a window of glass, with a toolbar capsule along its top:
 * Preview · Code · Install · Prompt, the selection a lens that slides between
 * them.
 *
 * The four views are in-page anchors too — `#code`, `#install`, `#prompt` —
 * so the local nav, a shared link or the back button can open the window on
 * the right one. Every panel stays mounted and is only hidden, so the live
 * demo keeps its state while you read its source.
 */
export function ComponentWindow({
  slug,
  title,
  code,
  install,
  prompt,
}: {
  slug: string
  title: string
  code: React.ReactNode
  install: React.ReactNode
  prompt: React.ReactNode
}) {
  const [view, setView] = React.useState<View>("preview")
  const frame = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function fromHash() {
      const hash = window.location.hash.slice(1)
      if (!isView(hash)) return
      setView(hash)
      /*
       * Bring the whole window under the floating chrome once the panel has
       * swapped — the browser's own jump runs before the new view lays out.
       */
      window.requestAnimationFrame(() => {
        const node = frame.current
        if (!node) return
        const top = node.getBoundingClientRect().top + window.scrollY - 136
        window.scrollTo({ top, behavior: "instant" })
      })
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [])

  const panels: Record<View, React.ReactNode> = {
    preview: <LivePreview slug={slug} />,
    code,
    install,
    prompt,
  }

  return (
    <div ref={frame} className="relative">
      {/* Anchors for the four views, at the top of the window. */}
      {VIEWS.map((entry) => (
        <span
          key={entry.value}
          id={entry.value}
          aria-hidden="true"
          className="absolute top-0 left-0 scroll-mt-[136px]"
        />
      ))}

      <Tabs.Root
        value={view}
        onValueChange={(next) => {
          if (isView(next)) setView(next)
        }}
        className="g-glass g-thin rounded-[42px] p-3"
      >
        <div className="relative flex items-center justify-center px-1 pt-0.5 pb-3">
          <Tabs.List
            aria-label={`${title} views`}
            className="g-well flex max-w-full items-center overflow-x-auto rounded-full p-[3px] [scrollbar-width:none]"
          >
            {VIEWS.map((entry) => (
              <Tabs.Trigger
                key={entry.value}
                value={entry.value}
                className={cn(
                  "relative h-9 shrink-0 cursor-pointer rounded-full px-4 text-[14px] tracking-[-0.016em] whitespace-nowrap transition-colors duration-200 sm:px-5",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
                  "text-[#3a3a3e] hover:text-[#1d1d1f] data-[state=active]:font-medium data-[state=active]:text-[#1d1d1f]"
                )}
              >
                {view === entry.value ? (
                  <motion.span
                    layoutId="g-window-lens"
                    transition={LENS_SPRING}
                    aria-hidden="true"
                    className="g-lens absolute inset-0 rounded-full"
                  />
                ) : null}
                <span className="relative">{entry.label}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Link
            href={`/preview/${slug}`}
            aria-label={`Open ${title} in a full-screen preview`}
            className="absolute top-0.5 right-1 hidden size-9 items-center justify-center rounded-full text-[#3a3a3e] transition-colors hover:bg-black/[0.05] hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] sm:flex"
          >
            <Maximize2 aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {VIEWS.map((entry) => (
          <Tabs.Content
            key={entry.value}
            value={entry.value}
            forceMount
            className={cn(
              "rounded-[30px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] data-[state=inactive]:hidden",
              entry.value === "preview"
                ? "g-inset overflow-hidden"
                : "bg-white/[0.62] p-4 shadow-[inset_0_0_0_0.5px_rgb(24_32_72/0.08)] sm:p-6"
            )}
          >
            {panels[entry.value]}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  )
}

function LivePreview({ slug }: { slug: string }) {
  const demo = renderPreview(slug)
  return (
    <div className="flex min-h-[30rem] items-center justify-center overflow-x-auto px-3 py-10 text-foreground sm:px-10 sm:py-14">
      {demo ? (
        <div className="flex w-full min-w-0 justify-center">{demo}</div>
      ) : (
        <p className="max-w-sm text-center text-[15px] text-[#56565b]">
          No demo is registered for this component yet.
        </p>
      )}
    </div>
  )
}

/** Several source files behind a segmented control; one file on its own. */
export function SourceFiles({
  files,
  label,
}: {
  files: Array<{ name: string; node: React.ReactNode }>
  label: string
}) {
  const [active, setActive] = React.useState(files[0]?.name ?? "")
  const first = files[0]
  if (!first) return null
  if (files.length === 1) return <>{first.node}</>

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        id="g-source-file"
        label={label}
        size="sm"
        options={files.map((file) => ({ value: file.name, label: file.name }))}
        value={active}
        onChange={setActive}
      />
      {files.map((file) => (
        <div key={file.name} hidden={file.name !== active}>
          {file.node}
        </div>
      ))}
    </div>
  )
}

/** The three ways in, behind a segmented control. */
export function InstallMethods({
  cli,
  url,
  manual,
}: {
  cli: React.ReactNode
  url: React.ReactNode
  manual: React.ReactNode
}) {
  const [method, setMethod] = React.useState<"cli" | "url" | "manual">("cli")
  const panels = { cli, url, manual }

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        id="g-install-method"
        label="Installation method"
        options={[
          { value: "cli", label: "CLI" },
          { value: "url", label: "From a URL" },
          { value: "manual", label: "Manual" },
        ]}
        value={method}
        onChange={setMethod}
        className="self-start"
      />
      {(["cli", "url", "manual"] as const).map((key) => (
        <div key={key} hidden={key !== method}>
          {panels[key]}
        </div>
      ))}
    </div>
  )
}
