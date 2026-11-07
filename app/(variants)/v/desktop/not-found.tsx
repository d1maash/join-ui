import type { Metadata } from "next"

import { MissingAlert } from "@/components/variants/desktop/missing-alert"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

/* A page that does not exist is an alert over the desktop, as the Mac would put it. */
export default function DesktopNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <MissingAlert />
    </main>
  )
}
