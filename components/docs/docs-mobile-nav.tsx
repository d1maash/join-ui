"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { Logo } from "@/components/docs/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { SidebarSection } from "@/lib/docs/sidebar"

export interface DocsMobileNavProps {
  sections: SidebarSection[]
}

/**
 * Drawer navigation for small screens.
 *
 * Radix Dialog supplies the focus trap, scroll lock and `Escape` handling; the
 * drawer closes on navigation so the user is never left with a stale overlay
 * after a client-side route change.
 */
export function DocsMobileNav({ sections }: DocsMobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close after a route change completes, including browser back/forward.
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">Site navigation</SheetTitle>
        <div className="border-b border-border px-4 py-3">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          <DocsSidebar
            sections={sections}
            label="Mobile documentation"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
