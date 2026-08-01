import Link from "next/link"

import { Logo } from "@/components/docs/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <Logo />
      </div>
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center"
      >
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
          That page does not exist. It may have been renamed, or the component
          you are looking for lives under a different slug.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/components">Browse components</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
