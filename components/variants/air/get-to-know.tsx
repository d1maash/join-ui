"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { Shelf } from "./shelf"

export interface KnowCard {
  id: string
  eyebrow: string
  title: string
  tone?: "light" | "dark"
  /** The picture on the card. Decorative — it is hidden from assistive tech. */
  art: React.ReactNode
  /** What the sheet says once the card is opened. */
  detail: React.ReactNode
}

/*
 * "Get to know" — the shelf Apple puts on every product page. Each card is a
 * headline and a picture with a round plus in its corner; pressing anywhere on
 * it opens a sheet with the longer story. The card is the button, so the whole
 * surface is the target and the plus is only its sign.
 */
export function GetToKnow({ label, cards }: { label: string; cards: KnowCard[] }) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const current = cards.find((card) => card.id === openId)

  return (
    <>
      <Shelf label={label}>
        {cards.map((card) => {
          const dark = card.tone === "dark"
          return (
            <li key={card.id} className="flex shrink-0">
              <button
                type="button"
                onClick={() => setOpenId(card.id)}
                aria-haspopup="dialog"
                className={cn(
                  "group relative flex h-[30rem] w-[min(20rem,78vw)] cursor-pointer flex-col overflow-hidden rounded-[28px] text-left sm:h-[33rem] sm:w-[23.25rem]",
                  "shadow-[2px_4px_12px_rgb(0_0_0/0.08)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:scale-[1.012] hover:shadow-[2px_6px_24px_rgb(0_0_0/0.14)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]",
                  dark ? "bg-black text-[#f5f5f7]" : "bg-white text-[#1d1d1f]"
                )}
              >
                <span className="relative z-10 px-7 pt-7 sm:px-8 sm:pt-8">
                  <span
                    className={cn(
                      "block text-[14px] font-semibold tracking-[-0.01em] sm:text-[17px]",
                      dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"
                    )}
                  >
                    {card.eyebrow}
                  </span>
                  <span className="mt-2 block text-[24px] leading-[1.14] font-semibold tracking-[-0.026em] text-balance sm:text-[28px]">
                    {card.title}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none relative flex flex-1 items-center justify-center px-7 pb-20"
                >
                  {card.art}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-5 bottom-5 flex size-9 items-center justify-center rounded-full transition-colors duration-200",
                    dark
                      ? "bg-[#333336] text-[#f5f5f7] group-hover:bg-[#424245]"
                      : "bg-[#1d1d1f] text-white group-hover:bg-[#424245]"
                  )}
                >
                  <Plus strokeWidth={2.4} className="size-5" />
                </span>
                <span className="sr-only">, learn more</span>
              </button>
            </li>
          )
        })}
      </Shelf>

      <Dialog.Root open={current !== undefined} onOpenChange={(open) => !open && setOpenId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="v-air air-overlay fixed inset-0 z-[80] overflow-y-auto bg-[rgb(0_0_0/0.48)] backdrop-blur-[16px]">
            <Dialog.Content
              aria-describedby={undefined}
              className="v-air light air-sheet relative mx-auto my-4 w-[calc(100%-1.5rem)] max-w-[61rem] rounded-[28px] bg-white font-sans text-[#1d1d1f] sm:my-10 sm:w-[calc(100%-4rem)]"
            >
              {current ? (
                <>
                  <div className="sticky top-0 z-10 flex justify-end p-4 sm:p-5">
                    <Dialog.Close
                      aria-label="Close"
                      className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#333336] text-[#f5f5f7] transition-colors hover:bg-[#424245] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                    >
                      <X aria-hidden="true" strokeWidth={2.4} className="size-4" />
                    </Dialog.Close>
                  </div>
                  <div className="-mt-16 px-6 pt-14 pb-14 sm:px-16 sm:pt-16 sm:pb-20 lg:px-[5.5rem]">
                    <p className="air-eyebrow text-[#6e6e73]">{current.eyebrow}</p>
                    <Dialog.Title className="air-h2 mt-3 max-w-[18ch] text-balance">
                      {current.title}
                    </Dialog.Title>
                    <div className="mt-10 sm:mt-14">{current.detail}</div>
                  </div>
                </>
              ) : null}
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/** One block of a sheet: a lead-in in ink, the rest of the paragraph in grey. */
export function KnowBlock({
  lead,
  children,
  aside,
}: {
  lead: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="rounded-[22px] bg-[#f5f5f7] p-7 sm:p-10">
      <p className="air-lede max-w-[40rem] text-[#6e6e73]">
        <strong className="font-semibold text-[#1d1d1f]">{lead}</strong> {children}
      </p>
      {aside ? <div className="mt-7">{aside}</div> : null}
    </div>
  )
}
