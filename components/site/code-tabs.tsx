"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface CodeTabItem {
  value: string
  label: string
  content: React.ReactNode
}

/** Switcher for a component that ships more than one file. */
export function CodeTabs({
  items,
  label,
}: {
  items: CodeTabItem[]
  label: string
}) {
  const first = items[0]
  if (!first) return null
  if (items.length === 1) return <>{first.content}</>

  return (
    <Tabs defaultValue={first.value}>
      <TabsList aria-label={label}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
