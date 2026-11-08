import type * as React from "react"

import { LibraryShell } from "@/components/variants/gallery/shell"

/*
 * Catalog, component pages and docs share one rail that is never remounted
 * between them, so a group opened in it stays open while you browse.
 */
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <LibraryShell>{children}</LibraryShell>
}
