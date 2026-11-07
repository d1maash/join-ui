"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Check, Monitor, Moon, Sun } from "lucide-react"

import { useStoredPreference } from "@/lib/hooks"
import { cn } from "@/lib/utils"

import { THEME_STORAGE_KEY } from "./theme-script"

export type ThemePreference = "light" | "dark" | "system"
export type Theme = "light" | "dark"

const PREFERENCES: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

function isPreference(value: string): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

const DARK_QUERY = "(prefers-color-scheme: dark)"
const CHANGE_EVENT = "studio-theme"

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored !== null && isPreference(stored) ? stored : "light"
  } catch {
    return "light"
  }
}

function resolve(preference: ThemePreference): Theme {
  if (preference !== "system") return preference
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

function root(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-studio-root]")
}

/**
 * Writes the theme onto the variant root. Transitions are switched off for
 * the frame the palette changes in, so a hundred hover transitions do not
 * all fade between themes at once.
 */
function applyTheme(theme: Theme) {
  const element = root()
  if (!element || element.classList.contains(theme)) return

  const freeze = document.createElement("style")
  freeze.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(freeze)

  element.classList.remove(theme === "dark" ? "light" : "dark")
  element.classList.add(theme)
  element.setAttribute("data-theme", theme)

  // Force the new styles to resolve before transitions come back.
  void window.getComputedStyle(element).color
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => freeze.remove()))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useThemePreference() {
  return useStoredPreference<ThemePreference>(THEME_STORAGE_KEY, "light", isPreference)
}

/**
 * Keeps the root in step with the stored preference — after a change, on a
 * client-side navigation into the variant (when the inline script never ran),
 * and when the OS flips while the preference is "system". It reads storage
 * itself rather than trusting the hook's value, which is the server's
 * "light" during hydration.
 */
export function ThemeSync() {
  const [preference] = useThemePreference()

  React.useLayoutEffect(() => {
    const sync = () => applyTheme(resolve(readPreference()))
    sync()
    const media = window.matchMedia(DARK_QUERY)
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [preference])

  return null
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/** The theme the page is actually showing. "light" until hydrated. */
export function useResolvedTheme(): Theme {
  return React.useSyncExternalStore(
    subscribeTheme,
    () => (root()?.classList.contains("dark") ? "dark" : "light"),
    () => "light"
  )
}

/** Header control: an icon that follows the theme, opening a three-way menu. */
export function ThemeMenu({ className }: { className?: string }) {
  const [preference, setPreference] = useThemePreference()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Change theme"
        className={cn(
          "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
          "transition-colors duration-150 hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "data-[state=open]:bg-muted data-[state=open]:text-foreground",
          className
        )}
      >
        <Sun aria-hidden="true" className="st-if-light size-4" />
        <Moon aria-hidden="true" className="st-if-dark size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 min-w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[state=open]:animate-pop-in"
          )}
        >
          <DropdownMenu.RadioGroup
            value={preference}
            onValueChange={(value) => {
              if (isPreference(value)) setPreference(value)
            }}
          >
            {PREFERENCES.map(({ value, label, icon: Icon }) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className={cn(
                  "flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-[13px] outline-none select-none",
                  "text-muted-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                  "data-[state=checked]:text-foreground"
                )}
              >
                <Icon aria-hidden="true" className="size-3.5" />
                <span className="flex-1">{label}</span>
                <DropdownMenu.ItemIndicator>
                  <Check aria-hidden="true" className="size-3.5" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/** Footer and mobile-sheet control: three segments, one per preference. */
export function ThemeSegmented({ className }: { className?: string }) {
  const [preference, setPreference] = useThemePreference()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border p-0.5",
        className
      )}
    >
      {PREFERENCES.map(({ value, label, icon: Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              active
                ? "bg-muted text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
