"use client"

import * as React from "react"
import { BarChart3, FolderGit2, Home, Settings2, Users } from "lucide-react"

import { FloatingDock } from "@/registry/components/floating-dock"

export default function FloatingDockPreview() {
  const [active, setActive] = React.useState("Home")

  const items = [
    { label: "Home", icon: <Home /> },
    { label: "Projects", icon: <FolderGit2 /> },
    { label: "Analytics", icon: <BarChart3 /> },
    { label: "Team", icon: <Users /> },
    { label: "Settings", icon: <Settings2 /> },
  ].map((item) => ({
    ...item,
    active: item.label === active,
    onClick: () => setActive(item.label),
  }))

  return (
    <div className="flex w-full flex-col items-center gap-6 py-6">
      <FloatingDock label="Workspace navigation" items={items} />
      <p className="text-sm text-muted-foreground">
        Selected: <span className="font-medium text-foreground">{active}</span>
      </p>
    </div>
  )
}
