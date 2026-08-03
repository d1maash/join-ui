import Link from "next/link"

import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <Logo />
      </div>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-center px-4 py-24 sm:px-6"
      >
        <p className="label-caps mb-6 text-muted-foreground">Error 404</p>
        <h1 className="text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-semibold tracking-[-0.02em]">
          Page not found
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-pretty text-muted-foreground">
          That page does not exist. It may have been renamed, or the component you are
          looking for lives under a different slug.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
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
