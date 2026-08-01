"use client"

import * as React from "react"
import Link from "next/link"
import {
  Maximize2,
  Monitor,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
  Tablet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { getPreviewComponent } from "@/components/previews/registry"
import { cn } from "@/lib/utils"

type PreviewTheme = "auto" | "light" | "dark"
type PreviewWidth = "full" | "tablet" | "mobile"

const WIDTHS: Record<PreviewWidth, { max: string; label: string }> = {
  full: { max: "100%", label: "Full width" },
  tablet: { max: "48rem", label: "Tablet — 768px" },
  mobile: { max: "24.375rem", label: "Mobile — 390px" },
}

const WIDTH_ICONS: Record<PreviewWidth, typeof Monitor> = {
  full: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
}

const THEME_ICONS: Record<PreviewTheme, typeof Sun> = {
  auto: Monitor,
  light: Sun,
  dark: Moon,
}

export interface ComponentPreviewProps {
  slug: string
  /** Component title, used for accessible names on the controls. */
  title: string
  /** Hide the toolbar — used by the standalone full-page preview. */
  controls?: boolean
  /** Show the "Open full preview" link. */
  fullPreviewLink?: boolean
  minHeight?: string
  className?: string
}

/**
 * Live preview frame with theme, width and remount controls.
 *
 * The theme switch works by scoping `.light` / `.dark` onto the preview
 * wrapper. Because every registry component themes through CSS variables and
 * never uses a `dark:` utility, custom-property inheritance makes the nearest
 * ancestor win — so a light preview inside a dark page renders correctly.
 */
export function ComponentPreview({
  slug,
  title,
  controls = true,
  fullPreviewLink = true,
  minHeight = "22rem",
  className,
}: ComponentPreviewProps) {
  const [theme, setTheme] = React.useState<PreviewTheme>("auto")
  const [width, setWidth] = React.useState<PreviewWidth>("full")
  const [remountKey, setRemountKey] = React.useState(0)

  const Preview = getPreviewComponent(slug)

  if (!Preview) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No preview is registered for <code className="font-mono">{slug}</code>.
      </div>
    )
  }

  const cycleTheme = () => {
    setTheme((current) =>
      current === "auto" ? "light" : current === "light" ? "dark" : "auto"
    )
  }

  const ThemeIcon = THEME_ICONS[theme]
  const nextThemeLabel =
    theme === "auto" ? "light" : theme === "light" ? "dark" : "page"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {controls ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
          <div
            role="group"
            aria-label="Preview width"
            className="flex items-center gap-0.5"
          >
            {(Object.keys(WIDTHS) as PreviewWidth[]).map((key) => {
              const Icon = WIDTH_ICONS[key]
              return (
                <SimpleTooltip key={key} label={WIDTHS[key].label}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-pressed={width === key}
                    aria-label={WIDTHS[key].label}
                    onClick={() => setWidth(key)}
                    className={cn(
                      width === key &&
                        "bg-card text-foreground shadow-[var(--shadow-subtle)]"
                    )}
                  >
                    <Icon aria-hidden="true" />
                  </Button>
                </SimpleTooltip>
              )
            })}
          </div>

          <div className="flex items-center gap-0.5">
            <SimpleTooltip label={`Switch preview to ${nextThemeLabel} theme`}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={cycleTheme}
                aria-label={`Preview theme: ${theme}. Switch to ${nextThemeLabel} theme.`}
              >
                <ThemeIcon aria-hidden="true" />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip label="Restart the preview">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setRemountKey((value) => value + 1)}
                aria-label={`Restart the ${title} preview`}
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </SimpleTooltip>

            {fullPreviewLink ? (
              <SimpleTooltip label="Open full preview">
                <Button asChild variant="ghost" size="icon-sm">
                  <Link
                    href={`/preview/${slug}`}
                    aria-label={`Open the ${title} preview on its own page`}
                  >
                    <Maximize2 aria-hidden="true" />
                  </Link>
                </Button>
              </SimpleTooltip>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          theme !== "auto" && theme,
          "backdrop-grid flex justify-center bg-background px-4 py-10 transition-colors sm:px-8"
        )}
        style={{
          colorScheme: theme === "auto" ? undefined : theme,
          minHeight,
        }}
      >
        <div
          key={remountKey}
          style={{ maxWidth: WIDTHS[width].max }}
          className="flex w-full items-center justify-center transition-[max-width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"
        >
          {/* eslint-disable-next-line react-hooks/static-components -- `previewRegistry` is a module-level constant map; the component identity for a given slug never changes between renders. */}
          <Preview />
        </div>
      </div>
    </div>
  )
}
