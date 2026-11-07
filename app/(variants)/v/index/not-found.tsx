import type { Metadata } from "next"

import { getIxSearchIndex } from "@/components/variants/index/data"
import { IxNotFound } from "@/components/variants/index/not-found"

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
}

export default function IndexNotFound() {
  const suggestions = getIxSearchIndex()
    .filter((entry) => entry.group !== "Categories")
    .map(({ id, title, href, code, group, keywords }) => ({ id, title, href, code, group, keywords }))
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <IxNotFound entries={suggestions} />
    </main>
  )
}
