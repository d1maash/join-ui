"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface ExpandableFeatureCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title" | "onChange"
> {
  title: React.ReactNode
  description: React.ReactNode
  icon?: React.ReactNode
  /** Revealed when the card is expanded. */
  children: React.ReactNode
  /** Uncontrolled initial state. */
  defaultOpen?: boolean
  /** Controlled state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Text of the toggle, read by assistive technology alongside the title. */
  expandLabel?: string
  collapseLabel?: string
}

/**
 * A feature tile that grows to reveal detail instead of navigating away.
 *
 * The whole header is one `button` with `aria-expanded` and `aria-controls`,
 * and the revealed panel is a labelled `region`, so the relationship survives
 * in the accessibility tree. Height animates from `auto` via Motion; with
 * reduced motion the panel simply appears.
 */
export function ExpandableFeatureCard({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  expandLabel = "Show more",
  collapseLabel = "Show less",
  className,
  ...props
}: ExpandableFeatureCardProps) {
  const id = React.useId()
  const panelId = `${id}-panel`
  const headerId = `${id}-header`
  const reduceMotion = useReducedMotion()

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? internalOpen

  const toggle = () => {
    const next = !open
    if (controlledOpen === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        "transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
        "hover:border-border-strong data-[state=open]:border-border-strong data-[state=open]:shadow-[var(--shadow-raised)]",
        className
      )}
      {...props}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={cn(
          "flex w-full cursor-pointer items-start gap-4 p-5 text-left",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        )}
      >
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground",
              "transition-colors duration-[var(--duration-base)]",
              "group-hover:text-foreground group-data-[state=open]:border-primary/40 group-data-[state=open]:bg-primary-soft group-data-[state=open]:text-primary",
              "[&_svg]:size-5"
            )}
          >
            {icon}
          </span>
        ) : null}

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[0.9375rem] font-semibold tracking-tight">{title}</span>
          <span className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground",
            "transition-[transform,color] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
            "group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <span className="sr-only">{open ? collapseLabel : expandLabel}</span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
