import { Desktop } from "@/components/variants/desktop/desktop"
import { HomeScreen } from "@/components/variants/desktop/home-screen"

/*
 * The landing page is the desktop itself: there is nothing below the fold,
 * because a desktop does not scroll. Below 768px the same page is a phone's
 * home screen instead. Both shells are in the HTML; CSS shows the right one
 * before any script runs, and only that one comes alive.
 */
export default function DesktopLanding() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <Desktop />
      <HomeScreen />
    </main>
  )
}
