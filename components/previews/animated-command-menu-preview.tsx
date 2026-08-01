"use client"

import * as React from "react"
import { FileText, GitBranch, Rocket, Settings2, Users } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { AnimatedCommandMenu } from "@/registry/components/animated-command-menu"

export default function AnimatedCommandMenuPreview() {
  const [open, setOpen] = React.useState(false)

  const run = (label: string) => () =>
    toast.success(`Ran “${label}”`, { description: "Wired up in the preview only." })

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open command menu
        <span className="ml-1 flex gap-0.5">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        The shortcut is live on this page — try it.
      </p>

      <AnimatedCommandMenu
        open={open}
        onOpenChange={setOpen}
        label="Project command menu"
        placeholder="Search projects and actions…"
        footer={
          <span className="flex flex-wrap items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </span>
        }
        groups={[
          {
            heading: "Actions",
            items: [
              {
                value: "deploy",
                label: "Deploy to production",
                description: "Promotes the current preview build",
                icon: <Rocket />,
                shortcut: ["⌘", "D"],
                keywords: ["ship", "release"],
                onSelect: run("Deploy to production"),
              },
              {
                value: "branch",
                label: "Create branch",
                icon: <GitBranch />,
                keywords: ["git", "new"],
                onSelect: run("Create branch"),
              },
            ],
          },
          {
            heading: "Navigate",
            items: [
              {
                value: "docs",
                label: "Open documentation",
                icon: <FileText />,
                onSelect: run("Open documentation"),
              },
              {
                value: "team",
                label: "Manage team",
                icon: <Users />,
                onSelect: run("Manage team"),
              },
              {
                value: "settings",
                label: "Project settings",
                icon: <Settings2 />,
                shortcut: ["⌘", ","],
                onSelect: run("Project settings"),
              },
            ],
          },
        ]}
      />
    </div>
  )
}
