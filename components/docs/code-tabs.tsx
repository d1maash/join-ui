"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface CodeTabItem {
  value: string
  label: string
  /** Pre-rendered `CodeBlock` from the server. */
  content: React.ReactNode
}

export interface CodeTabsProps {
  items: CodeTabItem[]
  defaultValue?: string
  className?: string
  /** Accessible name for the tab list. */
  label?: string
}

/**
 * Tabs over several pre-rendered code blocks — one file per tab.
 *
 * The blocks themselves are highlighted on the server and passed in as
 * children, so switching tabs is a pure DOM toggle with no client-side
 * highlighting cost.
 */
export function CodeTabs({
  items,
  defaultValue,
  className,
  label = "Files",
}: CodeTabsProps) {
  const first = items[0]
  if (!first) return null

  return (
    <Tabs
      defaultValue={defaultValue ?? first.value}
      className={cn("my-4", className)}
    >
      <TabsList aria-label={label}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="mt-2">
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
