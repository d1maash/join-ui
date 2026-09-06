"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Logo } from "@/components/site/logo"
import { Sidebar } from "@/components/site/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { SidebarSection } from "@/lib/docs/sidebar"

export function MobileNav({ sections }: { sections: SidebarSection[] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden">
          <Menu aria-hidden="true" className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="border-b border-border px-5 py-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-5">
          <Sidebar sections={sections} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
