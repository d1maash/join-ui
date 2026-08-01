"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface CommandMenuItem {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  /** Rendered right-aligned, e.g. `["⌘", "P"]`. */
  shortcut?: string[]
  /** Extra terms matched by the fuzzy filter. */
  keywords?: string[]
  onSelect: () => void
}

export interface CommandMenuGroup {
  heading: string
  items: CommandMenuItem[]
}

export interface AnimatedCommandMenuProps {
  groups: CommandMenuGroup[]
  /** Controlled visibility. Omit to let the component own its state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Single character opened with Cmd/Ctrl. Pass `null` to disable the built-in
   * shortcut and drive `open` yourself.
   */
  shortcut?: string | null
  placeholder?: string
  emptyMessage?: React.ReactNode
  /** Accessible name of the dialog, announced on open. */
  label?: string
  footer?: React.ReactNode
  className?: string
}

/**
 * A command palette that scales in from the caret rather than snapping open.
 *
 * Built on Radix Dialog (focus trap, scroll lock, `Escape` handling, inert
 * background) and cmdk (fuzzy filtering, roving selection). The exit animation
 * is driven by `AnimatePresence` with `forceMount`, so focus is restored to the
 * trigger only after the transition finishes.
 */
export function AnimatedCommandMenu({
  groups,
  open: controlledOpen,
  onOpenChange,
  shortcut = "k",
  placeholder = "Search commands…",
  emptyMessage = "No results found.",
  label = "Command menu",
  footer,
  className,
}: AnimatedCommandMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const reduceMotion = useReducedMotion()

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [controlledOpen, onOpenChange]
  )

  React.useEffect(() => {
    if (!shortcut) return
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setOpen(!open)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [shortcut, open, setOpen])

  const runItem = (item: CommandMenuItem) => {
    setOpen(false)
    // Let the dialog start closing before the action re-renders the page.
    requestAnimationFrame(() => item.onSelect())
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
                className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              className="fixed top-[12vh] left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2"
            >
              <motion.div
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 32, mass: 0.7 }
                }
              >
                <Dialog.Title className="sr-only">{label}</Dialog.Title>
                <Command
                  loop
                  className={cn(
                    "overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[var(--shadow-overlay)]",
                    className
                  )}
                >
                  <div className="flex items-center gap-2.5 border-b border-border px-4">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                    <Command.Input
                      autoFocus
                      placeholder={placeholder}
                      className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground sm:inline-block">
                      Esc
                    </kbd>
                  </div>

                  <Command.List className="max-h-[min(24rem,50vh)] overflow-y-auto overscroll-contain p-2">
                    <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                      {emptyMessage}
                    </Command.Empty>

                    {groups.map((group) => (
                      <Command.Group
                        key={group.heading}
                        heading={group.heading}
                        className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                      >
                        {group.items.map((item) => (
                          <Command.Item
                            key={item.value}
                            value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                            onSelect={() => runItem(item)}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
                              "transition-colors duration-[var(--duration-instant)]",
                              "data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                            )}
                          >
                            {item.icon ? (
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground [&_svg]:size-3.5">
                                {item.icon}
                              </span>
                            ) : null}
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-medium">{item.label}</span>
                              {item.description ? (
                                <span className="truncate text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              ) : null}
                            </span>
                            {item.shortcut ? (
                              <span className="ml-auto flex shrink-0 gap-1">
                                {item.shortcut.map((key) => (
                                  <kbd
                                    key={key}
                                    className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </span>
                            ) : null}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                  </Command.List>

                  {footer ? (
                    <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
                      {footer}
                    </div>
                  ) : null}
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
