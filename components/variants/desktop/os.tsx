"use client"

import * as React from "react"

import type { AppId, ComponentInfo, ComponentSlug } from "./apps"

/*
 * The window server.
 *
 * Lives in the layout, so it outlasts a navigation: open a component's page
 * from a window, come back, and the desktop is the way you left it. It holds
 * only what more than one surface needs — which windows exist and in what
 * order, which one has focus, where each Dock icon sits on screen — and
 * leaves position and animation to the windows themselves.
 */

export type WinStatus = "closed" | "open" | "minimized"

export interface WinState {
  status: WinStatus
  z: number
  zoomed: boolean
  /** Set the first time the window opens; it stays mounted after that. */
  mounted: boolean
  /** How it last opened, so it knows where to grow from. */
  via: "boot" | "dock" | "other"
}

type Wins = Partial<Record<AppId, WinState>>

interface OsValue {
  components: ComponentInfo[]
  component: (slug: ComponentSlug) => ComponentInfo | undefined
  wins: Wins
  focused: AppId | null
  open: (id: AppId, via?: WinState["via"]) => void
  close: (id: AppId) => void
  minimize: (id: AppId) => void
  focus: (id: AppId) => void
  toggleZoom: (id: AppId) => void
  /** Dock icons register themselves so a window can fly to and from them. */
  registerDockIcon: (id: AppId, node: HTMLElement | null) => void
  dockIcon: (id: AppId) => HTMLElement | null
  /** Ticks each time an app launches, which is what makes its icon bounce. */
  launches: Partial<Record<AppId, number>>
  /** Set while the landing page's desktop is on screen. */
  desktopMounted: boolean
  setDesktopMounted: (value: boolean) => void
  /** A window to open as soon as the desktop is back, asked for from another page. */
  pending: AppId | null
  setPending: (id: AppId | null) => void
  /** The desktop boots once per visit; coming back to it is not a reboot. */
  booted: boolean
  setBooted: (value: boolean) => void
  spotlightOpen: boolean
  setSpotlightOpen: (value: boolean) => void
  wallpaper: "colour" | "dither"
  setWallpaper: (value: "colour" | "dither") => void
  /** Notification badges on Dock icons. */
  badges: Partial<Record<AppId, number>>
  setBadge: (id: AppId, count: number) => void
  /** Lets the desktop answer a Dock click itself — say, by re-showing a notification. */
  setDockHandler: (id: AppId, handler: (() => boolean) | null) => void
  handleDock: (id: AppId) => boolean
}

const OsContext = React.createContext<OsValue | null>(null)

const WALLPAPER_KEY = "joinui-desktop-wallpaper"

export function OsProvider({
  components,
  children,
}: {
  components: ComponentInfo[]
  children: React.ReactNode
}) {
  const [wins, setWins] = React.useState<Wins>({})
  const [focused, setFocused] = React.useState<AppId | null>(null)
  const [launches, setLaunches] = React.useState<Partial<Record<AppId, number>>>({})
  const [desktopMounted, setDesktopMounted] = React.useState(false)
  const [pending, setPending] = React.useState<AppId | null>(null)
  const [booted, setBooted] = React.useState(false)
  const [spotlightOpen, setSpotlightOpen] = React.useState(false)
  const [wallpaper, setWallpaperState] = React.useState<"colour" | "dither">("colour")
  const [badges, setBadges] = React.useState<Partial<Record<AppId, number>>>({})
  const z = React.useRef(10)
  const icons = React.useRef(new Map<AppId, HTMLElement>())
  const handlers = React.useRef(new Map<AppId, () => boolean>())

  const setDockHandler = React.useCallback((id: AppId, handler: (() => boolean) | null) => {
    if (handler) handlers.current.set(id, handler)
    else handlers.current.delete(id)
  }, [])
  const handleDock = React.useCallback((id: AppId) => handlers.current.get(id)?.() ?? false, [])

  /* A remembered wallpaper is a convenience; a missing one is the default. */
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WALLPAPER_KEY)
      if (saved === "dither") setWallpaperState("dither")
    } catch {
      /* storage blocked — keep the default */
    }
  }, [])

  const setWallpaper = React.useCallback((value: "colour" | "dither") => {
    setWallpaperState(value)
    try {
      window.localStorage.setItem(WALLPAPER_KEY, value)
    } catch {
      /* storage blocked — the choice lasts for this visit */
    }
  }, [])

  const raise = React.useCallback((id: AppId) => {
    z.current += 1
    const top = z.current
    setWins((current) => {
      const win = current[id]
      if (!win || win.z === top) return current
      return { ...current, [id]: { ...win, z: top } }
    })
    setFocused(id)
  }, [])

  const latest = React.useRef(wins)
  React.useEffect(() => {
    latest.current = wins
  }, [wins])

  const open = React.useCallback((id: AppId, via: WinState["via"] = "other") => {
    z.current += 1
    const top = z.current
    const launching = latest.current[id]?.status !== "open"
    setWins((current) => {
      const win = current[id]
      if (win?.status === "open") return { ...current, [id]: { ...win, z: top } }
      return {
        ...current,
        [id]: { status: "open", z: top, zoomed: win?.zoomed ?? false, mounted: true, via },
      }
    })
    setFocused(id)
    if (via === "dock" && launching) {
      setLaunches((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
    }
  }, [])

  const settle = React.useCallback((id: AppId, status: WinStatus) => {
    setWins((current) => {
      const win = current[id]
      if (!win) return current
      return { ...current, [id]: { ...win, status } }
    })
    setFocused((current) => (current === id ? null : current))
  }, [])

  const close = React.useCallback((id: AppId) => settle(id, "closed"), [settle])
  const minimize = React.useCallback((id: AppId) => settle(id, "minimized"), [settle])

  const toggleZoom = React.useCallback((id: AppId) => {
    setWins((current) => {
      const win = current[id]
      if (!win) return current
      return { ...current, [id]: { ...win, zoomed: !win.zoomed } }
    })
  }, [])

  const registerDockIcon = React.useCallback((id: AppId, node: HTMLElement | null) => {
    if (node) icons.current.set(id, node)
    else icons.current.delete(id)
  }, [])

  const dockIcon = React.useCallback((id: AppId) => icons.current.get(id) ?? null, [])

  const setBadge = React.useCallback((id: AppId, count: number) => {
    setBadges((current) => (current[id] === count ? current : { ...current, [id]: count }))
  }, [])

  const bySlug = React.useMemo(
    () => new Map(components.map((component) => [component.slug, component])),
    [components]
  )

  /*
   * Focus follows the frontmost open window when the focused one goes away,
   * the way the Mac hands key status to the next window down.
   */
  React.useEffect(() => {
    if (focused && wins[focused]?.status === "open") return
    let best: AppId | null = null
    let bestZ = -1
    for (const [id, win] of Object.entries(wins) as [AppId, WinState][]) {
      if (win.status === "open" && win.z > bestZ) {
        best = id
        bestZ = win.z
      }
    }
    if (best !== focused) setFocused(best)
  }, [wins, focused])

  const value = React.useMemo<OsValue>(
    () => ({
      components,
      component: (slug) => bySlug.get(slug),
      wins,
      focused,
      open,
      close,
      minimize,
      focus: raise,
      toggleZoom,
      registerDockIcon,
      dockIcon,
      launches,
      desktopMounted,
      setDesktopMounted,
      pending,
      setPending,
      booted,
      setBooted,
      spotlightOpen,
      setSpotlightOpen,
      wallpaper,
      setWallpaper,
      badges,
      setBadge,
      setDockHandler,
      handleDock,
    }),
    [
      components,
      bySlug,
      wins,
      focused,
      open,
      close,
      minimize,
      raise,
      toggleZoom,
      registerDockIcon,
      dockIcon,
      launches,
      desktopMounted,
      pending,
      booted,
      spotlightOpen,
      wallpaper,
      setWallpaper,
      badges,
      setBadge,
      setDockHandler,
      handleDock,
    ]
  )

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>
}

export function useOs(): OsValue {
  const value = React.useContext(OsContext)
  if (!value) throw new Error("useOs must be used inside OsProvider")
  return value
}
