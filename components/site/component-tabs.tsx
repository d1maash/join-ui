"use client"

import type * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * The four views of a component page: what it looks like, what it is made of,
 * how to install it and what to hand an agent.
 */
export function ComponentTabs({
  preview,
  code,
  installation,
  prompt,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  installation: React.ReactNode
  prompt: React.ReactNode
}) {
  return (
    <Tabs defaultValue="preview">
      <TabsList aria-label="Component views">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="installation">Install</TabsTrigger>
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="code">{code}</TabsContent>
      <TabsContent value="installation">{installation}</TabsContent>
      <TabsContent value="prompt">{prompt}</TabsContent>
    </Tabs>
  )
}
