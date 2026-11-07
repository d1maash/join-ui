"use client"

import * as React from "react"
import Link from "next/link"
import { Maximize2, Moon, RotateCcw, Sun } from "lucide-react"

import { renderPreview } from "@/components/previews/registry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { useResolvedTheme, type Theme } from "./theme"

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
        "transition-colors duration-150 hover:bg-muted hover:text-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {children}
    </button>
  )
}

/**
 * The live stage, with its own theme island. It follows the page until the
 * reader flips it, so a component can be checked in the other theme without
 * repainting the docs around it. Replay remounts the demo, which replays any
 * entrance it has.
 */
export function PreviewStage({
  slug,
  title,
  minHeight = "28rem",
  className,
}: {
  slug: string
  title: string
  minHeight?: string
  className?: string
}) {
  const site = useResolvedTheme()
  const [island, setIsland] = React.useState<Theme | null>(null)
  const [run, setRun] = React.useState(0)
  const effective = island ?? site
  const demo = renderPreview(slug)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-background text-foreground",
        island,
        className
      )}
    >
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 rounded-lg border border-border bg-background/80 p-0.5 shadow-xs backdrop-blur-md">
        <ToolButton
          label={effective === "dark" ? "Preview in light" : "Preview in dark"}
          onClick={() => setIsland(effective === "dark" ? "light" : "dark")}
        >
          {effective === "dark" ? (
            <Sun aria-hidden="true" className="size-3.5" />
          ) : (
            <Moon aria-hidden="true" className="size-3.5" />
          )}
        </ToolButton>
        <ToolButton label="Replay" onClick={() => setRun((count) => count + 1)}>
          <RotateCcw aria-hidden="true" className="size-3.5" />
        </ToolButton>
        <Link
          href={`/preview/${slug}`}
          aria-label={`Open ${title} full screen`}
          title="Full screen"
          className={cn(
            "flex size-8 items-center justify-center rounded-md text-muted-foreground",
            "transition-colors duration-150 hover:bg-muted hover:text-foreground",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <Maximize2 aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
      <div
        key={run}
        className="flex w-full items-center justify-center px-5 pt-16 pb-10 sm:px-8"
        style={{ minHeight }}
      >
        {demo ?? (
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            No demo is registered for <code className="text-foreground">{slug}</code> yet.
          </p>
        )}
      </div>
    </div>
  )
}

/** Preview and Code, as two tabs over one frame. */
export function PreviewFrame({
  slug,
  title,
  code,
}: {
  slug: string
  title: string
  code?: React.ReactNode
}) {
  if (!code) return <PreviewStage slug={slug} title={title} />

  return (
    <Tabs defaultValue="preview">
      <TabsList aria-label={`${title} preview or code`}>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <PreviewStage slug={slug} title={title} />
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
