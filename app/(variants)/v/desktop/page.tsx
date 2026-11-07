import { Desktop } from "@/components/variants/desktop/desktop"

/*
 * The landing page is the desktop itself: there is nothing below the fold,
 * because a desktop does not scroll. On a phone the same page is a home
 * screen instead.
 */
export default function DesktopLanding() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <Desktop />
    </main>
  )
}
