import type * as React from "react"
import { Check, FileCode2, Folder } from "lucide-react"

import { siteConfig } from "@/lib/site"

/*
 * The pictures on the "Get to know" cards. Each one is drawn in the interface's
 * own materials — a Finder list, a keycap, a Settings switch — because the
 * thing being described is software, and software is what it looks like.
 */

export function OpenCodeArt() {
  const files = ["status-timeline.tsx", "tool-trace.tsx", "approval-gate.tsx"]
  return (
    <div className="w-full max-w-[17rem] rounded-[18px] bg-[#f5f5f7] p-3 text-[14px] text-[#1d1d1f]">
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium">
        <Folder className="size-4 fill-[#5ac8fa] text-[#34aadc]" strokeWidth={1.6} />
        {siteConfig.installTarget}
      </div>
      <ul className="mt-0.5">
        {files.map((file, index) => (
          <li
            key={file}
            className={
              index === 0
                ? "flex items-center gap-2 rounded-lg bg-[#0071e3] py-1.5 pr-2 pl-8 text-white"
                : "flex items-center gap-2 py-1.5 pr-2 pl-8"
            }
          >
            <FileCode2 className="size-4 shrink-0 opacity-80" strokeWidth={1.6} />
            <span className="truncate font-mono text-[12.5px]">{file}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PromptArt() {
  const lines = [
    "Add the <StatusTimeline> component",
    "to my existing Next.js application.",
    "",
    "Project stack:",
    "- Next.js (App Router), React 19",
    "- TypeScript in strict mode",
    "- Tailwind CSS v4 tokens",
    "",
    "Requirements:",
    "- Respect prefers-reduced-motion",
  ]
  return (
    <div className="relative w-full max-w-[17.5rem]">
      <pre className="font-mono text-[11.5px] leading-[1.6] text-[#a1a1a6] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]">
        {lines.join("\n")}
      </pre>
      <span className="absolute -bottom-2 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#0071e3] px-4 text-[14px] whitespace-nowrap text-white shadow-[0_8px_24px_rgb(0_113_227/0.35)]">
        Copy prompt
      </span>
    </div>
  )
}

function Key({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <span
      className={
        "flex h-14 items-center justify-center rounded-[12px] bg-white text-[15px] font-medium text-[#1d1d1f] shadow-[0_1px_0_1px_rgb(0_0_0/0.06),0_3px_0_rgb(0_0_0/0.08)] " +
        (wide ? "col-span-2" : "")
      }
    >
      {children}
    </span>
  )
}

export function KeyboardArt() {
  return (
    <div className="grid w-full max-w-[16rem] grid-cols-4 gap-2.5 rounded-[22px] bg-[#f5f5f7] p-3.5">
      <Key wide>tab</Key>
      <Key>esc</Key>
      <Key>↵</Key>
      <Key>←</Key>
      <Key>↑</Key>
      <Key>↓</Key>
      <Key>→</Key>
      <Key wide>space</Key>
      <Key>Y</Key>
      <Key>N</Key>
    </div>
  )
}

export function MotionArt() {
  return (
    <div className="w-full max-w-[17rem]">
      <div className="flex items-center justify-between rounded-[14px] bg-[#f5f5f7] px-4 py-3.5">
        <span className="text-[15px] text-[#1d1d1f]">Reduce Motion</span>
        <span className="relative h-[31px] w-[51px] rounded-full bg-[#34c759]">
          <span className="absolute top-[2px] right-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_3px_1px_rgb(0_0_0/0.06)]" />
        </span>
      </div>
      <p className="mt-3 px-1 text-[13px] leading-[1.4] text-[#6e6e73]">
        Every component settles into a complete, still layout.
      </p>
    </div>
  )
}

export function TypesArt() {
  return (
    <div className="w-full max-w-[17rem] rounded-[16px] bg-[#1c1c1e] p-4 font-mono text-[12.5px] leading-[1.7] text-[#f5f5f7] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <div className="mb-3 flex gap-1.5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <p>
        <span className="text-[#a1a1a6]">$</span> pnpm check
      </p>
      <p className="flex items-center gap-1.5 text-[#30d158]">
        <Check className="size-3.5" strokeWidth={2.6} /> registry valid
      </p>
      <p className="flex items-center gap-1.5 text-[#30d158]">
        <Check className="size-3.5" strokeWidth={2.6} /> tsc --noEmit
      </p>
      <p className="flex items-center gap-1.5 text-[#30d158]">
        <Check className="size-3.5" strokeWidth={2.6} /> eslint
      </p>
    </div>
  )
}
