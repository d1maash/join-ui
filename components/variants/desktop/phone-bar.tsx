"use client"

import { useNow } from "./hooks"

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" })

/*
 * The phone's status bar: the time on the left, the three glyphs on the
 * right. Decoration, and marked as such — the real one is right above it.
 */
export function PhoneStatusBar() {
  const now = useNow()
  return (
    <div
      className="d-phone-only relative z-10 flex h-12 items-center justify-between px-7 text-[15px] font-semibold tracking-[-0.01em] text-white"
      aria-hidden="true"
    >
      <span className="tabular-nums" suppressHydrationWarning>
        {now ? TIME.format(now) : ""}
      </span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-[11px] w-[17px]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 18 14" className="h-[12px] w-[16px]" fill="currentColor">
          <path d="M9 13.2 6.6 10.6a3.4 3.4 0 0 1 4.8 0L9 13.2Z" />
          <path d="M4.6 8.5a6.3 6.3 0 0 1 8.8 0l-1.3 1.4a4.4 4.4 0 0 0-6.2 0L4.6 8.5Z" />
          <path d="M2.4 6.2a9.5 9.5 0 0 1 13.2 0l-1.3 1.4a7.6 7.6 0 0 0-10.6 0L2.4 6.2Z" />
        </svg>
        <svg viewBox="0 0 27 13" className="h-[12px] w-[26px]">
          <rect x="0.6" y="0.6" width="22.8" height="11.8" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.1" />
          <rect x="2.2" y="2.2" width="16.4" height="8.6" rx="2.2" fill="currentColor" />
          <path d="M24.8 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  )
}
