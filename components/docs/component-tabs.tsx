"use client"

import type * as React from "react"
import { Code2, Eye, Sparkles, Terminal } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface ComponentTabsProps {
  preview: React.ReactNode
  code: React.ReactNode
  installation: React.ReactNode
  prompt: React.ReactNode
}

/**
 * Preview / Code / Installation / Prompt.
 *
 * All four panels are rendered on the server and passed in as children, so
 * switching tabs never triggers a fetch or re-highlight. Radix supplies the
 * ARIA tabs semantics and arrow-key navigation.
 */
export function ComponentTabs({
  preview,
  code,
  installation,
  prompt,
}: ComponentTabsProps) {
  return (
    <Tabs defaultValue="preview">
      <TabsList aria-label="Component views">
        <TabsTrigger value="preview">
          <Eye aria-hidden="true" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          <Code2 aria-hidden="true" />
          Code
        </TabsTrigger>
        <TabsTrigger value="installation">
          <Terminal aria-hidden="true" />
          Installation
        </TabsTrigger>
        <TabsTrigger value="prompt">
          <Sparkles aria-hidden="true" />
          Prompt
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="code">{code}</TabsContent>
      <TabsContent value="installation">{installation}</TabsContent>
      <TabsContent value="prompt">{prompt}</TabsContent>
    </Tabs>
  )
}
