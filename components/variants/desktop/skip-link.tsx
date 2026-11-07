"use client"

/*
 * Skip to content. Phone and Mac each render their own main region and CSS
 * shows one of them, so the link moves focus to whichever is on screen.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(event) => {
        const target = [...document.querySelectorAll<HTMLElement>("main")].find(
          (element) => element.getClientRects().length > 0
        )
        if (!target) return
        event.preventDefault()
        target.focus({ preventScroll: true })
        target.scrollIntoView({ block: "start" })
      }}
      className="sr-only z-[300] rounded-lg bg-[#0a84ff] px-4 py-2 text-[14px] font-medium text-white focus:not-sr-only focus:fixed focus:top-10 focus:left-3"
    >
      Skip to content
    </a>
  )
}
