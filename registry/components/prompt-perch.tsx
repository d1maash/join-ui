"use client"

import * as React from "react"
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import {
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Lightbulb,
  Paperclip,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** One entry in a picker — a style preset, a model. */
export interface PromptPerchOption {
  value: string
  label: string
  /** A second line under the label, in the muted face. */
  description?: string
  /** Set before the label in the menu, and on the trigger once chosen. */
  icon?: React.ReactNode
}

/** A ready-made prompt in the ideas tray. */
export interface PromptPerchIdea {
  /** What the row says. */
  label: string
  /** What is written into the composer when it is picked. Defaults to the label. */
  prompt?: string
  icon?: React.ReactNode
}

/** A tab in the ideas tray, and the ideas under it. */
export interface PromptPerchIdeaGroup {
  value: string
  label: string
  icon?: React.ReactNode
  ideas: readonly PromptPerchIdea[]
}

/** Everything the composer held when it was sent. */
export interface PromptPerchSubmission {
  /** The prompt, trimmed. */
  text: string
  files: File[]
  preset: string | null
  model: string | null
}

export type PromptPerchHeading = "h1" | "h2" | "h3" | "p"

export interface PromptPerchProps extends Omit<
  React.ComponentPropsWithoutRef<"form">,
  "title" | "onSubmit" | "defaultValue" | "children" | "autoFocus"
> {
  /** The headline set in the lid above the composer. `<strong>` inside it is set heavier. */
  title?: React.ReactNode
  /** The element the headline is set in. */
  titleAs?: PromptPerchHeading
  /** The placeholder. An array turns over one line at a time while the composer is empty and idle. */
  placeholder?: string | readonly string[]
  /** The accessible name of the field, and of the form when there is no headline. */
  label?: string
  /** The field's `name`, for a form `action` that reads `FormData`. */
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Fires on Enter or the send button, with the prompt, the files and the choices. */
  onSubmit?: (submission: PromptPerchSubmission) => void
  /** Empties the field and the attachments once a prompt is sent. */
  clearOnSubmit?: boolean
  /** The prompt is being worked on: the send button becomes stop and the companion thinks. */
  busy?: boolean
  /** Fires from the stop button while `busy`. */
  onStop?: () => void
  /** The style presets. Leave out and the picker is not drawn. */
  presets?: readonly PromptPerchOption[]
  preset?: string | null
  defaultPreset?: string | null
  onPresetChange?: (preset: string | null) => void
  /** The picker's name, and what it says while nothing is chosen. */
  presetLabel?: string
  /** The models. Leave out and the picker is not drawn. */
  models?: readonly PromptPerchOption[]
  model?: string
  defaultModel?: string
  onModelChange?: (model: string) => void
  /** The ideas tray. One group draws no tabs; none draws no tray and no toggle. */
  ideas?: readonly PromptPerchIdeaGroup[]
  ideasOpen?: boolean
  defaultIdeasOpen?: boolean
  onIdeasOpenChange?: (open: boolean) => void
  ideasLabel?: string
  /** Fires when an idea is picked, before it is written into the field. */
  onIdeaSelect?: (idea: PromptPerchIdea, group: PromptPerchIdeaGroup) => void
  /** Files can be attached with the clip, dropped on the composer, or pasted. */
  attachments?: boolean
  /** The file types taken, in the `accept` attribute's syntax. */
  accept?: string
  maxFiles?: number
  files?: File[]
  defaultFiles?: File[]
  onFilesChange?: (files: File[]) => void
  /** Fires with the files that were turned away — the wrong type, or over the limit. */
  onFilesReject?: (files: File[]) => void
  /** Whether voice input is on. The voice button is drawn only when `onListeningChange` is passed. */
  listening?: boolean
  onListeningChange?: (listening: boolean) => void
  /** The robot perched on the composer. */
  companion?: boolean
  /** The companion climbs up from behind the composer the first time it is seen. */
  peek?: boolean
  disabled?: boolean
  autoFocus?: boolean
  /** How tall the field grows, in lines, before it scrolls. */
  maxRows?: number
}

type Mood =
  | "idle"
  | "attentive"
  | "listening"
  | "thinking"
  | "happy"
  | "startled"
  | "upset"
  | "drowsy"

type Action = "stop" | "listening" | "send" | "voice" | "idle"

interface Point {
  x: number
  y: number
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The companion's unit. Every measurement on the robot is in ems of this, and
 * it is read off the component's own width, so the robot is the same size
 * relative to the composer in a sidebar as on a landing page.
 */
const PERCH = "clamp(7.5px, 2.45cqi, 17px)"
/** How far in from the composer's right edge it sits. */
const PERCH_RIGHT = "clamp(0.75rem, 8cqi, 4.5rem)"

/*
 * The robot, in ems. It is one rounded block standing behind the composer,
 * and its origin is the block's top edge. `EDGE` is where the composer's top
 * edge falls across it; below that it carries on out of sight. Its two grips
 * sit on the edge, a little wider than the block, hanging `GRIP` over the
 * front.
 */
const BODY_W = 7.2
const BODY_R = 2.5
const EDGE = 6.3
/** The shell left around the display. */
const BEZEL = 0.52
const FACE_H = 4.15
const GRIP = 0.48
const GRIP_W = 1.6
const GRIP_H = 1.02
/** How far each grip stands out past the block's side. */
const SPREAD = 0.4
/** The whole drawing's width, grips included. */
const W = BODY_W + SPREAD * 2

/**
 * The display's dot pitch, and the radius of one dot. The eyes are drawn as
 * smooth shapes and seen only through this grid, so every movement they make
 * is rendered the way an LED matrix renders it: dots coming up and going down
 * as the shape passes over them, partly lit at its edges.
 */
const PITCH = 0.3
const DOT = 0.1
const dots = (ink: string) =>
  `radial-gradient(circle, ${ink} ${DOT}em, transparent ${DOT + 0.03}em)`

/** How long a glance holds before the gaze drifts back to where it rests. */
const HOLD = 2400
/** How long nothing has to happen before the companion starts to nod off. */
const DROWSE = 32_000

const EASE = [0.32, 0.72, 0, 1] as const
const POP = { type: "spring", visualDuration: 0.32, bounce: 0.18 } as const
const SNAP = { type: "spring", visualDuration: 0.24, bounce: 0.1 } as const
/*
 * The eyes ride a stiff, nearly critical spring: a glance is quick and lands
 * without wobble, the way eyes move — and the head, which follows the same
 * signal through the same spring, turns with them rather than after them.
 */
const GAZE_SPRING = { stiffness: 340, damping: 30, mass: 0.7 }

/**
 * The companion's materials.
 *
 * It is an object, not a surface, so it does not change colour with the
 * theme the way a card does: it is white on a light page and the same white,
 * a few percent dimmer, on a dark one — mixed from white and the page's own
 * background, which is what dims it. It is lit from above and shaded below in
 * white and black, the one lighting that holds on any page. The display is
 * near-black in both themes, because a display is.
 */
const SHELL =
  "var(--prompt-perch-shell, color-mix(in oklab, white, var(--background) 8%))"
const SHADE = `color-mix(in oklab, ${SHELL}, black 10%)`
const SCREEN =
  "var(--prompt-perch-screen, color-mix(in oklab, var(--foreground) 5%, black))"
const LIT =
  "linear-gradient(to bottom, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0) 26%, rgb(0 0 0 / 0) 60%, rgb(0 0 0 / 0.07))"
const RIM =
  "inset 0 0 0 1px rgb(0 0 0 / 0.07), inset 0 0.06em 0 rgb(255 255 255 / 0.8)"
const DROP = "0 0.4em 1em -0.45em rgb(0 0 0 / 0.34)"
const BLOOM =
  "drop-shadow(0 0 0.09em color-mix(in oklab, currentColor 85%, transparent)) drop-shadow(0 0 0.4em color-mix(in oklab, currentColor 45%, transparent))"

/**
 * The eyes are the one place the robot spends hue, and only when there is
 * something to say. At rest they are white, because at rest there is no
 * state; they turn blue while it listens, green when a prompt goes out or the
 * work comes back, and red for a moment when a file is turned away.
 */
const EYE = "var(--prompt-perch-eye, color-mix(in oklab, white 92%, var(--foreground)))"
const EYE_HUE: Partial<Record<Mood, string>> = {
  listening: "var(--info)",
  happy: "var(--positive)",
  upset: "var(--critical)",
}

/** The shape of the eyes in each mood. `tilt` is the left eye's; the right mirrors it. */
const EYES: Record<
  Mood,
  { scaleX: number; scaleY: number; tilt: number; dim: number }
> = {
  idle: { scaleX: 1, scaleY: 1, tilt: 0, dim: 1 },
  attentive: { scaleX: 1.06, scaleY: 1.06, tilt: 0, dim: 1 },
  listening: { scaleX: 1, scaleY: 1, tilt: 0, dim: 1 },
  thinking: { scaleX: 1.1, scaleY: 0.34, tilt: 0, dim: 1 },
  happy: { scaleX: 1, scaleY: 0.25, tilt: 0, dim: 0 },
  startled: { scaleX: 1.22, scaleY: 1.22, tilt: 0, dim: 1 },
  upset: { scaleX: 1.04, scaleY: 0.56, tilt: 16, dim: 1 },
  drowsy: { scaleX: 1.1, scaleY: 0.2, tilt: 0, dim: 0.5 },
}

const TEXT = "px-3 pt-3 pb-1 text-[1.0625rem] leading-[1.625rem] tracking-[-0.014em]"

const CONTROL =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-[0.9375rem] font-medium tracking-[-0.012em] select-none transition-[background-color,border-color,color,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

const ICON = "size-[1.125rem] shrink-0"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const STILL = "(prefers-reduced-motion: reduce)"

/*
 * Read through a store with a server snapshot of "no", so the server's markup
 * and the client's first render agree and the still version arrives as an
 * ordinary re-render rather than a hydration mismatch.
 */
function subscribeStill(onChange: () => void) {
  const query = window.matchMedia(STILL)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readStill = () => window.matchMedia(STILL).matches
const stillOnServer = () => false

/** A value that is either the caller's or the component's own. */
function useControllable<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (next: T) => void
) {
  const [own, setOwn] = React.useState<T>(initial)
  const isControlled = controlled !== undefined
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setOwn(next)
      onChange?.(next)
    },
    [isControlled, onChange]
  )
  return [isControlled ? (controlled as T) : own, set] as const
}

const clamp = (n: number, min = -1, max = 1) => Math.min(max, Math.max(min, n))

function centreOf(element: Element): Point {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

/**
 * Where a point is, as seen from the robot's head: -1 to 1 on each axis. The
 * response is soft — linear near the head and saturating far from it — and is
 * scaled to the head's own size, so a robot drawn small glances as far at the
 * same thing as one drawn large.
 */
function toGaze(point: Point, head: DOMRect): Point {
  const reach = Math.max(head.width, 1) * 1.6
  const soft = (d: number, k: number) => clamp((d / (Math.abs(d) + k)) * 1.7)
  return {
    x: soft(point.x - (head.left + head.width / 2), reach),
    y: soft(point.y - (head.top + head.height * 0.55), reach * 0.75),
  }
}

/** The properties that decide where a textarea's text wraps. */
const MIRRORED = [
  "box-sizing",
  "width",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "font-variant",
  "font-feature-settings",
  "font-variation-settings",
  "letter-spacing",
  "line-height",
  "text-transform",
  "text-indent",
  "word-spacing",
  "tab-size",
] as const

/**
 * Where the caret is on screen.
 *
 * A textarea does not say, so its text up to the caret is set again in a
 * hidden copy that wraps exactly as it does, and a marker at the end of that
 * copy is measured. Offsets are layout pixels; the field's box is the visual
 * one, which includes any transform above it — a scaled thumbnail, a zoomed
 * preview — so the offsets are scaled by the ratio between the two.
 */
function caretPoint(
  field: HTMLTextAreaElement,
  index: number,
  mirror: HTMLDivElement
): Point {
  const style = getComputedStyle(field)
  for (const property of MIRRORED) {
    mirror.style.setProperty(property, style.getPropertyValue(property))
  }
  mirror.style.position = "absolute"
  mirror.style.visibility = "hidden"
  mirror.style.pointerEvents = "none"
  mirror.style.top = "0"
  mirror.style.left = "-9999px"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.overflowWrap = "break-word"
  mirror.textContent = field.value.slice(0, index)
  const marker = document.createElement("span")
  marker.textContent = "​"
  mirror.appendChild(marker)

  const box = field.getBoundingClientRect()
  const scale = field.offsetWidth > 0 ? box.width / field.offsetWidth : 1
  const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5
  return {
    x: box.left + (marker.offsetLeft - field.scrollLeft) * scale,
    y: box.top + (marker.offsetTop - field.scrollTop + line / 2) * scale,
  }
}

/** Matches a file against an `accept` string — extensions, `type/*`, or exact types. */
function accepts(file: File, accept?: string) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule)
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
      return type === rule
    })
}

const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`
}

function extension(file: File) {
  const dot = file.name.lastIndexOf(".")
  return dot > 0 ? file.name.slice(dot + 1).toUpperCase() : "FILE"
}

/*
 * Image previews are object URLs, shared and counted, so each one is revoked
 * the moment nothing shows it — on removal, on unmount, and correctly under
 * Strict Mode's double mount, which a create-in-render, revoke-in-cleanup pair
 * gets wrong.
 */
const previewUrls = new Map<File, { url: string; users: number }>()

function usePreviewUrl(file: File) {
  const image = file.type.startsWith("image/")
  const subscribe = React.useCallback(
    (notify: () => void) => {
      if (!image) return () => {}
      const entry = previewUrls.get(file)
      if (entry) entry.users += 1
      else previewUrls.set(file, { url: URL.createObjectURL(file), users: 1 })
      notify()
      return () => {
        const held = previewUrls.get(file)
        if (!held) return
        held.users -= 1
        if (held.users > 0) return
        URL.revokeObjectURL(held.url)
        previewUrls.delete(file)
      }
    },
    [file, image]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => (image ? (previewUrls.get(file)?.url ?? null) : null),
    () => null
  )
}

/* -------------------------------------------------------------------------- */
/* Gaze                                                                       */
/* -------------------------------------------------------------------------- */

type GazeMode = "free" | "thinking" | "listening"

interface Gaze {
  /** Where the eyes are pointed, -1 to 1. Raw targets; the robot springs to them. */
  gx: MotionValue<number>
  gy: MotionValue<number>
  /** A small dip of the head, in ems, played on each keystroke. */
  nod: MotionValue<number>
  head: React.RefObject<HTMLDivElement | null>
  drowsy: boolean
  /** Look at something — an element, or a point on screen — for a moment. */
  attend: (target: Element | Point | null | undefined) => void
  attendCaret: () => void
  nodOnce: () => void
  /** An idle glance a little way off, and back. */
  glance: () => void
  setMode: (mode: GazeMode, animated: boolean) => void
}

/**
 * Attention.
 *
 * The companion looks at whatever changed most recently — the pointer, the
 * caret, the control that took focus, the option under the keyboard — holds
 * the look for a moment, and then lets its eyes drift back to rest: on the end
 * of the text when there is some, straight out at the reader when there is
 * none. Everything is written into motion values, so following the pointer
 * re-renders nothing.
 */
function useGaze(
  field: React.RefObject<HTMLTextAreaElement | null>,
  enabled: boolean
): Gaze {
  const gx = useMotionValue(0)
  const gy = useMotionValue(0.12)
  const nod = useMotionValue(0)
  const head = React.useRef<HTMLDivElement | null>(null)
  const mirror = React.useRef<HTMLDivElement | null>(null)
  const hold = React.useRef<number | undefined>(undefined)
  const last = React.useRef(0)
  const lastNod = React.useRef(0)
  const locked = React.useRef(false)
  const sweep = React.useRef<ReturnType<typeof animate> | null>(null)
  const sleepy = React.useRef(false)
  const [drowsy, setDrowsy] = React.useState(false)

  const look = React.useCallback(
    (g: Point) => {
      gx.set(g.x)
      gy.set(g.y)
    },
    [gx, gy]
  )

  const gazeAt = React.useCallback((point: Point | null) => {
    const box = head.current?.getBoundingClientRect()
    return box && point ? toGaze(point, box) : null
  }, [])

  const caret = React.useCallback((): Point | null => {
    const element = field.current
    if (!element) return null
    if (!mirror.current) {
      mirror.current = document.createElement("div")
      mirror.current.setAttribute("aria-hidden", "true")
      document.body.appendChild(mirror.current)
    }
    const index =
      document.activeElement === element ? element.selectionEnd : element.value.length
    return caretPoint(element, index, mirror.current)
  }, [field])

  const rest = React.useCallback((): Point => {
    const element = field.current
    if (element && (element.value || document.activeElement === element)) {
      const at = gazeAt(caret())
      if (at) return at
    }
    return { x: 0, y: 0.12 }
  }, [field, caret, gazeAt])

  const toRest = React.useCallback(() => {
    window.clearTimeout(hold.current)
    if (!locked.current) look(rest())
  }, [look, rest])

  const attend = React.useCallback(
    (target: Element | Point | null | undefined) => {
      if (!enabled || !target) return
      last.current = performance.now()
      if (sleepy.current) {
        sleepy.current = false
        setDrowsy(false)
      }
      if (locked.current) return
      const at = gazeAt(target instanceof Element ? centreOf(target) : target)
      if (!at) return
      look(at)
      window.clearTimeout(hold.current)
      hold.current = window.setTimeout(toRest, HOLD)
    },
    [enabled, gazeAt, look, toRest]
  )

  const attendCaret = React.useCallback(() => {
    if (enabled) attend(caret())
  }, [enabled, attend, caret])

  const nodOnce = React.useCallback(() => {
    const now = performance.now()
    if (!enabled || now - lastNod.current < 150) return
    lastNod.current = now
    animate(nod, [0, 0.12, 0], { duration: 0.24, ease: "easeOut" })
  }, [enabled, nod])

  const glance = React.useCallback(() => {
    if (!enabled || locked.current || performance.now() - last.current < 1600) return
    const base = rest()
    look({
      x: clamp(base.x + (Math.random() - 0.5) * 0.9),
      y: clamp(base.y + (Math.random() - 0.4) * 0.5),
    })
    window.clearTimeout(hold.current)
    hold.current = window.setTimeout(toRest, 520 + Math.random() * 480)
  }, [enabled, rest, look, toRest])

  /*
   * Thinking and listening own the eyes. Thinking looks up and sweeps from
   * side to side, the way someone looks while working a thing out; listening
   * looks straight back at the person talking. Neither is interrupted by the
   * pointer.
   */
  const setMode = React.useCallback(
    (mode: GazeMode, animated: boolean) => {
      sweep.current?.stop()
      sweep.current = null
      window.clearTimeout(hold.current)
      locked.current = mode !== "free"
      if (mode === "free") {
        look(rest())
        return
      }
      if (mode === "listening") {
        look({ x: 0, y: 0.05 })
        return
      }
      gy.set(-0.5)
      if (!animated) {
        gx.set(0)
        return
      }
      gx.set(-0.55)
      sweep.current = animate(gx, 0.55, {
        duration: 1.25,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      })
    },
    [gx, gy, look, rest]
  )

  React.useEffect(() => {
    if (!enabled) return
    last.current = performance.now()
    const id = window.setInterval(() => {
      if (locked.current || sleepy.current) return
      if (performance.now() - last.current < DROWSE) return
      if (document.activeElement === field.current) return
      sleepy.current = true
      setDrowsy(true)
    }, 4000)
    return () => window.clearInterval(id)
  }, [enabled, field])

  const dispose = React.useCallback(() => {
    window.clearTimeout(hold.current)
    sweep.current?.stop()
    mirror.current?.remove()
    mirror.current = null
  }, [])
  React.useEffect(() => dispose, [dispose])

  return React.useMemo(
    () => ({
      gx,
      gy,
      nod,
      head,
      drowsy,
      attend,
      attendCaret,
      nodOnce,
      glance,
      setMode,
    }),
    [gx, gy, nod, drowsy, attend, attendCaret, nodOnce, glance, setMode]
  )
}

/* -------------------------------------------------------------------------- */
/* PromptPerch                                                                */
/* -------------------------------------------------------------------------- */

const NO_FILES: File[] = []

/**
 * Prompt Perch.
 *
 * A prompt composer with a companion perched on it: a small robot that hooks
 * its hands over the composer's top edge and watches whatever you are doing.
 * Its eyes follow the caret as you type and the pointer as you move it, glance
 * at the control that takes focus and the option the keyboard is on, and
 * drift back to rest when nothing is happening — so the one moving thing on
 * the screen is always pointed at the thing you are attending to.
 *
 * Around it is everything a prompt box is usually built out of by hand: a
 * field that grows with its text, attachments by clip, drop or paste, a style
 * picker and a model picker, an ideas tray of ready-made prompts that type
 * themselves in when picked, and one dark button that is voice when the field
 * is empty, send when it is not, and stop while the prompt is being worked on.
 *
 * The robot's eyes are the only hue it spends, and the hue is its state:
 * green at rest, blue while it listens, red for a moment when a file is
 * turned away. It squints and sweeps while it thinks, hops when a prompt is
 * sent and again when the work is done, widens its eyes at a file dragged
 * over it, and nods off after half a minute of nothing.
 *
 * Under `prefers-reduced-motion` nothing moves on its own: the robot is
 * simply there, looking ahead, and changes expression without animating;
 * ideas are written in at once, and the tray opens without travel.
 */
export function PromptPerch({
  title,
  titleAs: Heading = "h2",
  placeholder = "What do you want to make?",
  label = "Prompt",
  name = "prompt",
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  clearOnSubmit = true,
  busy = false,
  onStop,
  presets,
  preset: presetProp,
  defaultPreset = null,
  onPresetChange,
  presetLabel = "Style",
  models,
  model: modelProp,
  defaultModel,
  onModelChange,
  ideas,
  ideasOpen: ideasOpenProp,
  defaultIdeasOpen = true,
  onIdeasOpenChange,
  ideasLabel = "Ideas",
  onIdeaSelect,
  attachments = true,
  accept,
  maxFiles = 8,
  files: filesProp,
  defaultFiles,
  onFilesChange,
  onFilesReject,
  listening = false,
  onListeningChange,
  companion = true,
  peek = true,
  disabled = false,
  autoFocus = false,
  maxRows = 8,
  className,
  style,
  onFocus,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  ...rest
}: PromptPerchProps) {
  const uid = React.useId()
  const still = React.useSyncExternalStore(subscribeStill, readStill, stillOnServer)

  const rootRef = React.useRef<HTMLFormElement>(null)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const trayRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dragDepth = React.useRef(0)
  const fillFrame = React.useRef(0)

  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [files, setFiles] = useControllable(
    filesProp,
    defaultFiles ?? NO_FILES,
    onFilesChange
  )
  const [preset, setPreset] = useControllable<string | null>(
    presetProp,
    defaultPreset,
    onPresetChange
  )
  const reportModel = React.useCallback(
    (next: string | null) => {
      if (next !== null) onModelChange?.(next)
    },
    [onModelChange]
  )
  const [model, setModel] = useControllable<string | null>(
    modelProp,
    defaultModel ?? models?.[0]?.value ?? null,
    reportModel
  )
  const [trayOpen, setTrayOpen] = useControllable(
    ideasOpenProp,
    defaultIdeasOpen,
    onIdeasOpenChange
  )

  const [focused, setFocused] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [flash, setFlash] = React.useState<{ mood: "happy" | "upset" } | null>(null)
  const [live, setLive] = React.useState("")

  /* The work finishing is worth a hop: noticed during render, not in an effect. */
  const [wasBusy, setWasBusy] = React.useState(busy)
  if (wasBusy !== busy) {
    setWasBusy(busy)
    if (wasBusy) setFlash({ mood: "happy" })
  }

  React.useEffect(() => {
    if (!flash) return
    const id = window.setTimeout(
      () => setFlash(null),
      flash.mood === "happy" ? 1100 : 900
    )
    return () => window.clearTimeout(id)
  }, [flash])

  const enabled = companion && !still
  const gaze = useGaze(fieldRef, enabled)
  const { attend, attendCaret, nodOnce, glance, setMode } = gaze

  const mood: Mood =
    flash?.mood ??
    (dragging
      ? "startled"
      : listening
        ? "listening"
        : busy
          ? "thinking"
          : gaze.drowsy && !focused
            ? "drowsy"
            : focused
              ? "attentive"
              : "idle")

  const say = React.useCallback(
    (text: string) => setLive((previous) => (previous === text ? `${text} ` : text)),
    []
  )

  /* ---- The companion's attention ---------------------------------------- */

  React.useEffect(() => {
    if (!enabled) return
    setMode(
      mood === "thinking" ? "thinking" : mood === "listening" ? "listening" : "free",
      true
    )
  }, [enabled, mood, setMode])

  /* The pointer, while it is anywhere near the component. */
  React.useEffect(() => {
    if (!enabled) return
    let frame = 0
    let latest: Point | null = null
    const onMove = (event: PointerEvent) => {
      latest = { x: event.clientX, y: event.clientY }
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const root = rootRef.current
        if (!root || !latest) return
        const box = root.getBoundingClientRect()
        const near = 140
        if (
          latest.x < box.left - near ||
          latest.x > box.right + near ||
          latest.y < box.top - near ||
          latest.y > box.bottom + near
        ) {
          return
        }
        attend(latest)
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled, attend])

  /* Idle glances, every few seconds, while nothing else is going on. */
  React.useEffect(() => {
    if (!enabled || mood !== "idle") return
    let id = 0
    const next = () => {
      id = window.setTimeout(
        () => {
          glance()
          next()
        },
        2400 + Math.random() * 3200
      )
    }
    next()
    return () => window.clearTimeout(id)
  }, [enabled, mood, glance])

  /* Reading along: the caret, whoever moved it — a keystroke, an idea, a voice. */
  const seen = React.useRef(value)
  React.useEffect(() => {
    if (seen.current === value) return
    seen.current = value
    if (!enabled) return
    attendCaret()
    nodOnce()
  }, [value, enabled, attendCaret, nodOnce])

  /* ---- The field -------------------------------------------------------- */

  const fit = React.useCallback(() => {
    const field = fieldRef.current
    if (!field) return
    const computed = getComputedStyle(field)
    const line = parseFloat(computed.lineHeight) || 26
    const padding = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom)
    const max = line * maxRows + padding
    field.style.height = "auto"
    field.style.height = `${Math.min(field.scrollHeight, max)}px`
    field.style.overflowY = field.scrollHeight > max ? "auto" : "hidden"
  }, [maxRows])

  React.useLayoutEffect(() => {
    fit()
  }, [value, fit])

  React.useEffect(() => {
    const box = boxRef.current
    if (!box) return
    let width = box.offsetWidth
    const observer = new ResizeObserver(() => {
      if (box.offsetWidth === width) return
      width = box.offsetWidth
      fit()
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [fit])

  const stopFill = React.useCallback(() => {
    cancelAnimationFrame(fillFrame.current)
    fillFrame.current = 0
  }, [])
  React.useEffect(() => stopFill, [stopFill])

  /**
   * Writes a prompt into the field. With motion it types itself in — quickly,
   * decelerating, in under a second however long it is — so the companion has
   * something to read along with, and the reader sees that it is now theirs
   * to edit. A keystroke during the typing stops it where it is.
   */
  const fill = (text: string) => {
    stopFill()
    const field = fieldRef.current
    field?.focus({ preventScroll: true })
    const placeCaret = () =>
      requestAnimationFrame(() => field?.setSelectionRange(text.length, text.length))
    if (still) {
      setValue(text)
      placeCaret()
      return
    }
    const duration = Math.min(900, 260 + text.length * 11)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) * (1 - t)
      setValue(text.slice(0, Math.round(eased * text.length)))
      if (t < 1) {
        fillFrame.current = requestAnimationFrame(step)
      } else {
        fillFrame.current = 0
        placeCaret()
      }
    }
    fillFrame.current = requestAnimationFrame(step)
  }

  /* ---- Files ------------------------------------------------------------ */

  const addFiles = (incoming: File[]) => {
    if (!attachments || disabled || incoming.length === 0) return
    const present = new Set(files.map(fileKey))
    const room = Math.max(0, maxFiles - files.length)
    const taken: File[] = []
    const rejected: File[] = []
    for (const file of incoming) {
      if (present.has(fileKey(file))) continue
      if (taken.length < room && accepts(file, accept)) {
        taken.push(file)
        present.add(fileKey(file))
      } else {
        rejected.push(file)
      }
    }
    if (taken.length > 0) {
      setFiles([...files, ...taken])
      say(
        taken.length === 1
          ? `Attached ${taken[0]!.name}`
          : `Attached ${taken.length} files`
      )
    }
    if (rejected.length > 0) {
      onFilesReject?.(rejected)
      setFlash({ mood: "upset" })
      say(
        rejected.length === 1
          ? `Could not attach ${rejected[0]!.name}`
          : `Could not attach ${rejected.length} files`
      )
    }
  }

  const removeFile = (file: File) => {
    setFiles(files.filter((f) => f !== file))
    say(`Removed ${file.name}`)
    fieldRef.current?.focus({ preventScroll: true })
  }

  const hasFiles = (event: React.DragEvent) =>
    attachments && !disabled && Array.from(event.dataTransfer.types).includes("Files")

  /* ---- Sending ---------------------------------------------------------- */

  const hasContent = value.trim().length > 0 || files.length > 0
  const voice = typeof onListeningChange === "function"
  const action: Action = busy
    ? "stop"
    : listening
      ? "listening"
      : hasContent
        ? "send"
        : voice
          ? "voice"
          : "idle"

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) event.preventDefault()
    if (disabled || busy || !hasContent) {
      event.preventDefault()
      return
    }
    stopFill()
    onSubmit?.({ text: value.trim(), files: [...files], preset, model })
    setFlash({ mood: "happy" })
    say("Sent")
    if (clearOnSubmit) {
      setValue("")
      if (files.length > 0) setFiles([])
    }
    fieldRef.current?.focus({ preventScroll: true })
  }

  const handleAction = () => {
    if (action === "stop") onStop?.()
    else if (action === "voice" || action === "listening") {
      onListeningChange?.(!listening)
      say(listening ? "Stopped listening" : "Listening")
    }
  }

  const toggleTray = () => {
    const next = !trayOpen
    setTrayOpen(next)
    if (next) requestAnimationFrame(() => attend(trayRef.current))
  }

  const hasIdeas = Boolean(ideas && ideas.length > 0)
  const lines = typeof placeholder === "string" ? [placeholder] : placeholder
  const hintId = `${uid}-hint`
  const titleId = `${uid}-title`
  const trayId = `${uid}-tray`

  return (
    <MotionConfig reducedMotion="user">
      <form
        ref={rootRef}
        noValidate
        aria-label={title ? undefined : label}
        aria-labelledby={title ? titleId : undefined}
        className={cn("@container relative w-full text-foreground", className)}
        style={style}
        onSubmit={handleSubmit}
        onFocus={(event) => {
          onFocus?.(event)
          const target = event.target as Element
          if (target !== fieldRef.current) attend(target)
        }}
        onDragEnter={(event) => {
          onDragEnter?.(event)
          if (!hasFiles(event)) return
          event.preventDefault()
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragOver={(event) => {
          onDragOver?.(event)
          if (!hasFiles(event)) return
          event.preventDefault()
          event.dataTransfer.dropEffect = "copy"
          attend({ x: event.clientX, y: event.clientY })
        }}
        onDragLeave={(event) => {
          onDragLeave?.(event)
          if (!hasFiles(event)) return
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setDragging(false)
        }}
        onDrop={(event) => {
          onDrop?.(event)
          if (!hasFiles(event)) return
          event.preventDefault()
          dragDepth.current = 0
          setDragging(false)
          addFiles(Array.from(event.dataTransfer.files))
        }}
        {...rest}
      >
        <div
          className="relative flex flex-col"
          style={
            {
              "--perch": PERCH,
              paddingTop:
                companion && !title ? `calc(var(--perch) * ${EDGE + 0.25})` : undefined,
            } as React.CSSProperties
          }
        >
          {title ? (
            <div
              className="flex items-end rounded-[1.75rem] border border-border bg-card/40 px-6 pt-10 pb-6 @md:px-8 @md:pb-7"
              style={{
                minHeight: `calc(var(--perch) * ${EDGE} + 6rem)`,
                paddingRight: companion
                  ? `calc(${PERCH_RIGHT} + var(--perch) * ${W} + 1.25rem)`
                  : undefined,
              }}
            >
              <Heading
                id={titleId}
                className="text-[clamp(1.5rem,4.6cqi,2.375rem)] leading-[1.12] font-normal tracking-[-0.035em] text-balance text-foreground [&_b]:font-semibold [&_strong]:font-semibold"
              >
                {title}
              </Heading>
            </div>
          ) : null}

          <div
            ref={boxRef}
            className={cn(
              "relative z-10 rounded-[1.75rem] border bg-card p-2.5 shadow-md transition-[border-color] duration-300",
              focused ? "border-border-hover" : "border-border",
              title ? "mt-3" : undefined,
              disabled && "opacity-60"
            )}
            onMouseDown={(event) => {
              if (event.target !== event.currentTarget || disabled) return
              event.preventDefault()
              fieldRef.current?.focus()
            }}
          >
            {companion ? (
              <Perch
                mood={mood}
                still={still}
                peek={peek}
                gx={gaze.gx}
                gy={gaze.gy}
                nod={gaze.nod}
                head={gaze.head}
              />
            ) : null}

            <AnimatePresence>
              {dragging ? (
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute inset-1.5 z-20 flex items-center justify-center rounded-[1.4rem] border-2 border-dashed border-info bg-info-soft/85 text-[0.9375rem] font-medium tracking-[-0.012em] text-info"
                >
                  <span className="flex items-center gap-2">
                    <Paperclip className={ICON} strokeWidth={1.9} />
                    Drop to attach
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="relative">
              <Placeholder
                lines={lines}
                hidden={value.length > 0}
                paused={focused || value.length > 0}
                still={still}
              />
              <textarea
                ref={fieldRef}
                name={name}
                rows={2}
                value={value}
                disabled={disabled}
                autoFocus={autoFocus}
                placeholder={lines[0]}
                aria-label={label}
                aria-describedby={hintId}
                spellCheck
                className={cn(
                  "block w-full resize-none bg-transparent text-foreground caret-foreground outline-none placeholder:text-transparent disabled:cursor-not-allowed",
                  TEXT
                )}
                onChange={(event) => {
                  stopFill()
                  setValue(event.target.value)
                }}
                onFocus={() => {
                  setFocused(true)
                  attendCaret()
                }}
                onBlur={() => setFocused(false)}
                onSelect={attendCaret}
                onPaste={(event) => {
                  if (!attachments || disabled) return
                  const pasted = Array.from(event.clipboardData.files)
                  if (pasted.length === 0 || event.clipboardData.getData("text/plain"))
                    return
                  event.preventDefault()
                  addFiles(pasted)
                }}
                onKeyDown={(event) => {
                  const field = event.currentTarget
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    event.keyCode !== 229
                  ) {
                    event.preventDefault()
                    rootRef.current?.requestSubmit()
                    return
                  }
                  if (
                    event.key === "ArrowDown" &&
                    hasIdeas &&
                    trayOpen &&
                    field.selectionStart === field.value.length &&
                    field.selectionEnd === field.value.length
                  ) {
                    const first =
                      trayRef.current?.querySelector<HTMLElement>("[data-idea]")
                    if (first) {
                      event.preventDefault()
                      first.focus()
                    }
                  }
                }}
              />
              <span id={hintId} className="sr-only">
                Enter sends, Shift and Enter starts a new line.
              </span>
            </div>

            {files.length > 0 ? (
              <FileChips files={files} disabled={disabled} onRemove={removeFile} />
            ) : null}

            <div className="flex items-center justify-between gap-2 pt-1.5">
              <div className="flex min-w-0 items-center gap-1.5 @md:gap-2">
                {attachments ? (
                  <>
                    <button
                      type="button"
                      aria-label="Attach files"
                      disabled={disabled || files.length >= maxFiles}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        CONTROL,
                        "w-10 border border-border text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Paperclip className={ICON} strokeWidth={1.75} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      tabIndex={-1}
                      multiple={maxFiles > 1}
                      accept={accept}
                      onChange={(event) => {
                        addFiles(Array.from(event.target.files ?? []))
                        event.target.value = ""
                      }}
                    />
                  </>
                ) : null}

                {presets && presets.length > 0 ? (
                  <Picker
                    label={presetLabel}
                    options={presets}
                    value={preset}
                    onChange={setPreset}
                    clearable
                    disabled={disabled}
                    variant="outline"
                    align="start"
                    attend={attend}
                  />
                ) : null}

                {hasIdeas ? (
                  <button
                    type="button"
                    aria-expanded={trayOpen}
                    aria-controls={trayId}
                    disabled={disabled}
                    onClick={toggleTray}
                    className={cn(
                      CONTROL,
                      "w-10 border @md:w-auto @md:px-4",
                      trayOpen
                        ? "border-transparent bg-info-soft text-info"
                        : "border-border text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Lightbulb className={ICON} strokeWidth={1.75} />
                    <span className="@max-md:sr-only">{ideasLabel}</span>
                  </button>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1 @md:gap-1.5">
                {models && models.length > 0 ? (
                  <Picker
                    label="Model"
                    options={models}
                    value={model}
                    onChange={setModel}
                    disabled={disabled}
                    variant="ghost"
                    align="end"
                    leading={<Spark className="size-4" />}
                    attend={attend}
                  />
                ) : null}
                <ActionButton
                  action={action}
                  disabled={disabled || (action === "stop" && !onStop)}
                  still={still}
                  onClick={handleAction}
                />
              </div>
            </div>
          </div>

          {hasIdeas ? (
            <IdeaTray
              ref={trayRef}
              id={trayId}
              groups={ideas!}
              open={trayOpen}
              label={ideasLabel}
              disabled={disabled}
              onPick={(idea, group) => {
                onIdeaSelect?.(idea, group)
                fill(idea.prompt ?? idea.label)
              }}
              onExitTop={() => fieldRef.current?.focus()}
            />
          ) : null}
        </div>

        <span aria-live="polite" className="sr-only">
          {live}
        </span>
      </form>
    </MotionConfig>
  )
}

/* -------------------------------------------------------------------------- */
/* Placeholder                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The placeholder, set over the field rather than in it so that a list of them
 * can turn over — each line rolls up and out of focus as the next one rises
 * into it. The field keeps the first line as its real placeholder, hidden, so
 * assistive technology still reads one.
 */
function Placeholder({
  lines,
  hidden,
  paused,
  still,
}: {
  lines: readonly string[]
  hidden: boolean
  paused: boolean
  still: boolean
}) {
  const [index, setIndex] = React.useState(0)
  const count = lines.length

  React.useEffect(() => {
    if (count < 2 || paused || still) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 3200)
    return () => window.clearInterval(id)
  }, [count, paused, still])

  const text = lines[index % Math.max(count, 1)] ?? ""

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 flex overflow-hidden text-muted-foreground",
        TEXT,
        hidden && "opacity-0"
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className="block min-w-0 truncate"
          initial={{ y: "70%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-70%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Files                                                                      */
/* -------------------------------------------------------------------------- */

function FileChips({
  files,
  disabled,
  onRemove,
}: {
  files: File[]
  disabled: boolean
  onRemove: (file: File) => void
}) {
  return (
    <ul aria-label="Attachments" className="flex flex-wrap gap-2 px-1.5 pt-1 pb-1.5">
      <AnimatePresence initial={false} mode="popLayout">
        {files.map((file) => (
          <motion.li
            key={fileKey(file)}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={POP}
            className="group/file relative"
          >
            <FileChip file={file} disabled={disabled} onRemove={onRemove} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function FileChip({
  file,
  disabled,
  onRemove,
}: {
  file: File
  disabled: boolean
  onRemove: (file: File) => void
}) {
  const url = usePreviewUrl(file)

  return (
    <>
      <div className="flex h-12 max-w-[15rem] items-center gap-2.5 rounded-2xl border border-border bg-background/50 pr-3.5 pl-1.5">
        {url ? (
          // A blob URL of the reader's own file: there is nothing for an image optimiser to do.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="size-9 shrink-0 rounded-[0.6rem] object-cover"
          />
        ) : (
          <span className="grid size-9 shrink-0 place-items-center rounded-[0.6rem] bg-muted text-muted-foreground">
            <FileText className="size-4" strokeWidth={1.75} />
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.8125rem] leading-tight font-medium tracking-[-0.006em]">
            {file.name}
          </span>
          <span className="text-xs leading-tight text-muted-foreground">
            {extension(file)} · {formatBytes(file.size)}
          </span>
        </span>
      </div>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={() => onRemove(file)}
        className={cn(
          "absolute -top-1.5 -right-1.5 grid size-5 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-sm",
          "opacity-0 transition-[opacity,scale] duration-150 group-hover/file:opacity-100 focus-visible:opacity-100 active:scale-90 [@media(pointer:coarse)]:opacity-100",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <X className="size-3" strokeWidth={2.6} />
      </button>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Picker                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A button that opens a listbox: the style and the model.
 *
 * Built here rather than borrowed, so the component brings no menu library
 * with it. It is the listbox pattern — the trigger says it has one and whether
 * it is open, focus moves into the list, the active option is named through
 * `aria-activedescendant` — with arrows, Home and End, typeahead, Enter or
 * Space to choose, and Escape to close and hand focus back. It opens upward
 * when there is no room below.
 */
function Picker({
  label,
  options,
  value,
  onChange,
  clearable = false,
  disabled,
  variant,
  align,
  leading,
  attend,
}: {
  label: string
  options: readonly PromptPerchOption[]
  value: string | null
  onChange: (value: string | null) => void
  clearable?: boolean
  disabled: boolean
  variant: "outline" | "ghost"
  align: "start" | "end"
  leading?: React.ReactNode
  attend: (target: Element | null | undefined) => void
}) {
  const id = React.useId()
  const listId = `${id}-list`
  const optionId = (index: number) => `${id}-option-${index}`
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [above, setAbove] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const typed = React.useRef({ text: "", at: 0 })

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = options[selectedIndex]

  const show = (index: number) => {
    const trigger = triggerRef.current
    if (trigger) {
      const box = trigger.getBoundingClientRect()
      const height =
        12 + options.reduce((sum, option) => sum + (option.description ? 54 : 40), 0)
      const below = window.innerHeight - box.bottom
      setAbove(below < height + 16 && box.top > below)
    }
    setActive(Math.max(0, index))
    setOpen(true)
  }

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(clearable && option.value === value ? null : option.value)
    close(true)
  }

  React.useEffect(() => {
    if (!open) return
    listRef.current?.focus({ preventScroll: true })
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const activeId = optionId(active)
  React.useEffect(() => {
    if (!open) return
    const element = document.getElementById(activeId)
    element?.scrollIntoView({ block: "nearest" })
    attend(element)
  }, [open, activeId, attend])

  const onListKey = (event: React.KeyboardEvent) => {
    const count = options.length
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActive((index) => (index + 1) % count)
        return
      case "ArrowUp":
        event.preventDefault()
        setActive((index) => (index - 1 + count) % count)
        return
      case "Home":
        event.preventDefault()
        setActive(0)
        return
      case "End":
        event.preventDefault()
        setActive(count - 1)
        return
      case "Enter":
      case " ":
        event.preventDefault()
        choose(active)
        return
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        close(true)
        return
      case "Tab":
        setOpen(false)
        return
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = event.timeStamp
      const text = (now - typed.current.at < 600 ? typed.current.text : "") + event.key
      typed.current = { text: text.toLowerCase(), at: now }
      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(typed.current.text)
      )
      if (match >= 0) setActive(match)
    }
  }

  const shown = selected?.label ?? label

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={selected ? `${label}: ${selected.label}` : label}
        onClick={() => (open ? close(false) : show(selectedIndex))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            show(event.key === "ArrowUp" ? options.length - 1 : selectedIndex)
          }
        }}
        className={cn(
          CONTROL,
          "max-w-full min-w-0",
          variant === "outline"
            ? "border border-border px-3.5 text-foreground hover:bg-muted/60 @md:px-4"
            : "px-2.5 text-foreground hover:bg-muted/70 @md:px-3",
          open && "bg-muted/70"
        )}
      >
        {(selected?.icon ?? leading) ? (
          <span className="grid shrink-0 place-items-center [&_svg]:size-4">
            {selected?.icon ?? leading}
          </span>
        ) : null}
        <span
          className={cn(
            "min-w-0 truncate",
            variant === "ghost" ? "@max-xl:hidden" : "max-w-[6.5rem] @md:max-w-[10rem]"
          )}
        >
          {shown}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={activeId}
            initial={{ opacity: 0, scale: 0.96, y: above ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
            transition={POP}
            style={{
              transformOrigin: `${align === "end" ? "right" : "left"} ${above ? "bottom" : "top"}`,
            }}
            onKeyDown={onListKey}
            onBlur={(event) => {
              if (!wrapRef.current?.contains(event.relatedTarget as Node | null))
                setOpen(false)
            }}
            className={cn(
              "absolute z-50 max-h-80 w-max max-w-[18rem] min-w-[14rem] overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg outline-none",
              above ? "bottom-full mb-2" : "top-full mt-2",
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              return (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 select-none",
                    index === active && "bg-muted"
                  )}
                >
                  {option.icon ? (
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground [&_svg]:size-4">
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[0.9375rem] leading-snug font-medium tracking-[-0.012em]">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="text-[0.8125rem] leading-snug text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                    strokeWidth={2.2}
                  />
                </div>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* The action button                                                          */
/* -------------------------------------------------------------------------- */

const ACTION_LABEL: Record<Action, string> = {
  stop: "Stop",
  listening: "Stop voice input",
  send: "Send",
  voice: "Start voice input",
  idle: "Send",
}

/**
 * The one dark shape on the composer. It is voice while there is nothing to
 * send, send once there is, and stop while the prompt is worked on — one
 * place to look, whatever the next move is. The glyphs cross through a blur
 * rather than sliding, so the change reads as the same button changing its
 * mind.
 */
function ActionButton({
  action,
  disabled,
  still,
  onClick,
}: {
  action: Action
  disabled: boolean
  still: boolean
  onClick: () => void
}) {
  const glyph =
    action === "stop"
      ? "stop"
      : action === "voice" || action === "listening"
        ? "voice"
        : "send"

  return (
    <button
      type={action === "send" ? "submit" : "button"}
      aria-label={ACTION_LABEL[action]}
      disabled={disabled || action === "idle"}
      onClick={action === "send" ? undefined : onClick}
      className={cn(
        CONTROL,
        "relative w-14 overflow-hidden bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-30"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={glyph}
          className="grid place-items-center"
          initial={{ opacity: 0, scale: 0.55, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.55, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {glyph === "stop" ? (
            <span className="size-3 rounded-[3px] bg-current" />
          ) : glyph === "voice" ? (
            <VoiceBars live={action === "listening"} still={still} />
          ) : (
            <ArrowUp className="size-[1.1875rem]" strokeWidth={2.25} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

const BARS = [0.36, 0.68, 1, 0.6, 0.32]

function VoiceBars({ live, still }: { live: boolean; still: boolean }) {
  const moving = live && !still
  return (
    <span className="flex h-4 items-center gap-[2.5px]">
      {BARS.map((height, index) => (
        <motion.span
          key={index}
          className="w-[2.5px] rounded-full bg-current"
          style={{ height: `${height * 100}%` }}
          animate={
            moving
              ? { scaleY: [1, 0.35 + (index % 2) * 0.25, 1.2, 0.55, 1] }
              : { scaleY: 1 }
          }
          transition={
            moving
              ? {
                  duration: 0.85 + index * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.06,
                }
              : SNAP
          }
        />
      ))}
    </span>
  )
}

/** A four-pointed spark, filled — the mark a model picker is usually led by. */
function Spark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Ideas                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The tray of ready-made prompts, under the composer.
 *
 * Its height follows its contents — measured, and sprung to — so switching to
 * a tab with more ideas grows the tray rather than jumping it, and closing it
 * folds it away; once closed it is inert, so nothing inside it can be tabbed
 * to. Tabs are a real tablist with arrow keys; the ideas are buttons, walked
 * with the arrows too, and the highlight under the pointer or the keyboard
 * slides from row to row.
 */
function IdeaTray({
  ref,
  id,
  groups,
  open,
  label,
  disabled,
  onPick,
  onExitTop,
}: {
  ref: React.Ref<HTMLDivElement>
  id: string
  groups: readonly PromptPerchIdeaGroup[]
  open: boolean
  label: string
  disabled: boolean
  onPick: (idea: PromptPerchIdea, group: PromptPerchIdeaGroup) => void
  onExitTop: () => void
}) {
  const uid = React.useId()
  const [tab, setTab] = React.useState(groups[0]?.value ?? "")
  const [lit, setLit] = React.useState<number | null>(null)
  const [height, setHeight] = React.useState<number | null>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const tabsRef = React.useRef<HTMLDivElement>(null)

  const groupIndex = Math.max(
    0,
    groups.findIndex((group) => group.value === tab)
  )
  const group = groups[groupIndex]!
  const tabbed = groups.length > 1

  React.useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? inner.offsetHeight)
    })
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  const select = (index: number, focus: boolean) => {
    const next = groups[index]
    if (!next) return
    setTab(next.value)
    setLit(null)
    if (focus)
      tabsRef.current?.querySelectorAll<HTMLElement>("[role=tab]")[index]?.focus()
  }

  const onTabKey = (event: React.KeyboardEvent) => {
    const count = groups.length
    const to =
      event.key === "ArrowRight"
        ? (groupIndex + 1) % count
        : event.key === "ArrowLeft"
          ? (groupIndex - 1 + count) % count
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : null
    if (to === null) return
    event.preventDefault()
    select(to, true)
  }

  const onRowKey = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    const rows = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[data-idea]")
    )
    const index = rows.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    event.preventDefault()
    if (event.key === "ArrowUp" && index === 0) {
      onExitTop()
      return
    }
    rows[
      Math.min(
        rows.length - 1,
        Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1))
      )
    ]?.focus()
  }

  const tabId = (index: number) => `${uid}-tab-${index}`

  return (
    <motion.div
      id={id}
      inert={!open}
      initial={false}
      animate={{ height: open ? (height ?? "auto") : 0, opacity: open ? 1 : 0 }}
      transition={{ height: POP, opacity: { duration: open ? 0.24 : 0.14 } }}
      className="overflow-hidden"
    >
      <div ref={innerRef} className="pt-3">
        <LayoutGroup id={uid}>
          <div
            ref={ref}
            className="rounded-[1.75rem] border border-border bg-card/40 p-2.5"
            onPointerLeave={() => setLit(null)}
          >
            {tabbed ? (
              <div
                ref={tabsRef}
                role="tablist"
                aria-label={label}
                onKeyDown={onTabKey}
                className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto @md:gap-2 [&::-webkit-scrollbar]:hidden"
              >
                {groups.map((item, index) => {
                  const selected = index === groupIndex
                  return (
                    <button
                      key={item.value}
                      id={tabId(index)}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`${uid}-panel`}
                      tabIndex={selected ? 0 : -1}
                      disabled={disabled}
                      onClick={() => select(index, false)}
                      className={cn(
                        CONTROL,
                        "relative px-3.5 focus-visible:-outline-offset-2 @md:px-4",
                        selected
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {selected ? (
                        <motion.span
                          layoutId="tab"
                          className="absolute inset-0 rounded-full bg-muted"
                          transition={POP}
                        />
                      ) : (
                        <span className="absolute inset-0 rounded-full border border-border" />
                      )}
                      <span className="relative flex items-center gap-2 [&_svg]:size-[1.0625rem] [&_svg]:shrink-0">
                        {item.icon}
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div
              id={`${uid}-panel`}
              role={tabbed ? "tabpanel" : undefined}
              aria-labelledby={tabbed ? tabId(groupIndex) : undefined}
              aria-label={tabbed ? undefined : label}
              className={cn("relative", tabbed && "mt-2")}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.ul
                  key={group.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.28, ease: EASE }}
                  onKeyDown={onRowKey}
                  className="flex flex-col"
                >
                  {group.ideas.map((idea, index) => {
                    const on = lit === index
                    return (
                      <li key={`${idea.label}-${index}`}>
                        <button
                          type="button"
                          data-idea=""
                          disabled={disabled}
                          onClick={() => onPick(idea, group)}
                          onPointerEnter={() => setLit(index)}
                          onFocus={() => setLit(index)}
                          onBlur={() =>
                            setLit((current) => (current === index ? null : current))
                          }
                          className="relative flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none"
                        >
                          {on ? (
                            <motion.span
                              layoutId="lit"
                              className="absolute inset-0 rounded-2xl border border-border bg-muted/60"
                              transition={SNAP}
                            />
                          ) : null}
                          <span className="relative grid shrink-0 place-items-center text-muted-foreground [&_svg]:size-[1.125rem]">
                            {idea.icon ?? group.icon ?? (
                              <Lightbulb strokeWidth={1.75} />
                            )}
                          </span>
                          <span
                            className={cn(
                              "relative min-w-0 flex-1 text-[0.9375rem] leading-snug tracking-[-0.012em] transition-colors duration-200",
                              on ? "text-foreground" : "text-foreground/75"
                            )}
                          >
                            {idea.label}
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            strokeWidth={1.9}
                            className={cn(
                              "relative size-4 shrink-0 transition-[opacity,translate] duration-200",
                              on
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-1 opacity-0"
                            )}
                          />
                        </button>
                      </li>
                    )
                  })}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>
      </div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* The companion                                                              */
/* -------------------------------------------------------------------------- */

const shell = (shadow?: string): React.CSSProperties => ({
  backgroundColor: SHELL,
  backgroundImage: LIT,
  boxShadow: shadow ? `${RIM}, ${shadow}` : RIM,
})

/**
 * The robot.
 *
 * Drawn from rounded rectangles in ems, so it scales with its unit and stays
 * crisp at any size. It stands behind the composer and looks over it, the
 * way a figure looks over a wall: the body — torso, neck and head — is
 * clipped at the composer's top edge, so the torso carries on out of sight
 * and on its first appearance the whole robot rises from behind it; the two
 * hands are in front, gripping the edge with their fingers curled over.
 *
 * The screen is a `.dark` theme island. The hues on it read the dark theme's
 * values whatever theme the page is in — lit colours on a dark glass — and the
 * component needs no colour of its own to get them.
 *
 * The head turns toward what the eyes look at, a few degrees, pivoting on the
 * neck; the eyes move further than the head does, which is what gives the
 * face depth.
 */
const Perch = React.memo(function Perch({
  mood,
  still,
  peek,
  gx,
  gy,
  nod,
  head,
}: {
  mood: Mood
  still: boolean
  peek: boolean
  gx: MotionValue<number>
  gy: MotionValue<number>
  nod: MotionValue<number>
  head: React.RefObject<HTMLDivElement | null>
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, amount: 0.3 })

  const sx = useSpring(gx, GAZE_SPRING)
  const sy = useSpring(gy, GAZE_SPRING)
  const shake = useMotionValue(0)
  const blink = useMotionValue(1)
  const hop = useMotionValue(0)
  const droop = useMotionValue(0)
  const hidden = peek && !still
  const rise = useMotionValue(hidden ? EDGE + 0.6 : 0)
  const reach = useMotionValue(hidden ? 0 : 1)

  const eyeX = useTransform(sx, (v) => `${v * 1.12}em`)
  const eyeY = useTransform(sy, (v) => `${v * 0.62}em`)
  const headX = useTransform(
    [sx, shake],
    (v: number[]) => `${(v[0] ?? 0) * 0.22 + (v[1] ?? 0)}em`
  )
  const headY = useTransform(
    [sy, nod, droop],
    (v: number[]) => `${(v[0] ?? 0) * 0.16 + (v[1] ?? 0) + (v[2] ?? 0) * 0.3}em`
  )
  const headRotate = useTransform(
    [sx, shake, droop],
    (v: number[]) => (v[0] ?? 0) * 6 + (v[1] ?? 0) * 18 - (v[2] ?? 0) * 5
  )
  const bodyY = useTransform(
    [rise, hop],
    (v: number[]) => `${(v[0] ?? 0) + (v[1] ?? 0)}em`
  )
  /* The hands arrive with a little drop onto the edge, and press into it as the body hops. */
  const handY = useTransform(
    [reach, hop],
    (v: number[]) => `${(1 - (v[0] ?? 0)) * -0.9}em`
  )
  const handScale = useTransform(
    [reach, hop],
    (v: number[]) => (v[0] ?? 0) * (1 + (v[1] ?? 0) * 0.08)
  )

  /*
   * The climb. The hands come over the edge first and grip it, then the body
   * rises from behind the composer on a spring with a little overshoot, and
   * the eyes open once it is up.
   */
  React.useEffect(() => {
    if (still) {
      rise.set(0)
      reach.set(1)
      blink.set(1)
      return
    }
    if (!peek || !inView) return
    blink.set(0.1)
    const grab = animate(reach, 1, {
      type: "spring",
      visualDuration: 0.34,
      bounce: 0.3,
      delay: 0.1,
    })
    const climb = animate(rise, 0, {
      type: "spring",
      visualDuration: 0.7,
      bounce: 0.24,
      delay: 0.32,
    })
    const wake = animate(blink, 1, { duration: 0.2, delay: 0.95, ease: "easeOut" })
    return () => {
      grab.stop()
      climb.stop()
      wake.stop()
    }
  }, [still, peek, inView, rise, reach, blink])

  /* Nodding off: the head sinks a little and tips to one side. */
  React.useEffect(() => {
    const sleepy = mood === "drowsy" ? 1 : 0
    if (still) {
      droop.set(sleepy)
      return
    }
    const sink = animate(
      droop,
      sleepy,
      sleepy ? { duration: 1.6, ease: "easeInOut" } : SNAP
    )
    return () => sink.stop()
  }, [still, mood, droop])

  /* Blinks, now and then — sometimes twice. */
  React.useEffect(() => {
    if (still || (mood !== "idle" && mood !== "attentive")) return
    let id = 0
    const next = () => {
      id = window.setTimeout(
        () => {
          const twice = Math.random() < 0.18
          animate(blink, twice ? [1, 0.1, 1, 0.1, 1] : [1, 0.1, 1], {
            duration: twice ? 0.42 : 0.18,
            ease: "easeInOut",
          })
          next()
        },
        2400 + Math.random() * 3600
      )
    }
    next()
    return () => window.clearTimeout(id)
  }, [still, mood, blink])

  /* A hop for a prompt sent and for work done; a shake for a file turned away. */
  React.useEffect(() => {
    if (still) return
    if (mood === "happy") {
      animate(hop, [0, -0.75, 0, -0.12, 0], {
        duration: 0.72,
        times: [0, 0.3, 0.58, 0.76, 1],
        ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
      })
    } else if (mood === "upset") {
      animate(shake, [0, -0.22, 0.2, -0.14, 0.08, 0], {
        duration: 0.5,
        ease: "easeInOut",
      })
    }
  }, [still, mood, hop, shake])

  const eyeHue = EYE_HUE[mood] ?? EYE
  const led = LED_HUE[mood]

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-30 select-none"
      style={{
        fontSize: "var(--perch)",
        right: PERCH_RIGHT,
        bottom: `calc(100% - ${GRIP}em)`,
        width: `${W}em`,
        height: `${EDGE + GRIP}em`,
      }}
    >
      {/* The body, clipped at the composer's edge so it can rise from behind it. */}
      <div
        className="absolute overflow-hidden"
        style={{ left: "-3em", right: "-3em", top: "-3em", bottom: `${GRIP}em` }}
      >
        <motion.div
          className="absolute"
          style={{
            left: "3em",
            top: "3em",
            width: `${W}em`,
            height: `${EDGE}em`,
            y: bodyY,
          }}
        >
          {/* The neck, in the shadow under the head. */}
          <div
            className="absolute"
            style={{
              left: `${(W - 1.3) / 2}em`,
              top: "4.6em",
              width: "1.3em",
              height: "1.2em",
              backgroundColor: SHADE,
              boxShadow: RIM,
            }}
          />
          {/* The torso, carrying on below the edge, out of sight. */}
          <div
            className="absolute rounded-t-[1.7em]"
            style={{
              left: `${(W - TORSO_W) / 2}em`,
              top: "5.5em",
              width: `${TORSO_W}em`,
              height: "3.6em",
              ...shell(DROP),
            }}
          >
            <div
              className="absolute left-1/2 h-[0.3em] w-[1.5em] -translate-x-1/2 rounded-full"
              style={{
                top: "0.75em",
                backgroundColor: SHADE,
                boxShadow: "inset 0 0.05em 0.1em rgb(0 0 0 / 0.16)",
              }}
            />
          </div>

          <motion.div
            ref={head}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: `${W}em`,
              height: "4.95em",
              x: headX,
              y: headY,
              rotate: headRotate,
              originX: 0.5,
              originY: 0.95,
            }}
          >
            {/* Ears. */}
            {(["left", "right"] as const).map((side) => (
              <div
                key={side}
                className="absolute rounded-full"
                style={{
                  [side]: "-0.3em",
                  top: "1.6em",
                  width: "0.62em",
                  height: "1.7em",
                  backgroundColor: SHADE,
                  boxShadow: RIM,
                }}
              />
            ))}

            <div className="absolute inset-0 rounded-[1.8em]" style={shell(DROP)} />

            {/* The lamp on top: dark glass at rest, the mood's hue when there is one. */}
            <div
              className="absolute left-1/2 size-[0.66em] -translate-x-1/2 rounded-full"
              style={{ top: "-0.24em", ...shell() }}
            >
              <motion.div
                className="absolute inset-[0.16em] rounded-full transition-[background-color,box-shadow] duration-300"
                style={{
                  color: led,
                  backgroundColor: led ?? SCREEN,
                  boxShadow: led ? GLOW : undefined,
                }}
                animate={
                  mood === "thinking" && !still
                    ? { opacity: [1, 0.3, 1] }
                    : { opacity: 1 }
                }
                transition={
                  mood === "thinking" && !still
                    ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
              />
            </div>

            {/* The visor: a bezel, and the screen set into it. */}
            <div
              className="absolute rounded-[1.42em]"
              style={{
                inset: "0.46em 0.44em 0.72em",
                backgroundColor: SHADE,
                boxShadow: "inset 0 0.06em 0.12em rgb(0 0 0 / 0.14)",
              }}
            >
              <div
                className="dark absolute overflow-hidden rounded-[1.3em]"
                style={{
                  inset: "0.13em",
                  backgroundColor: SCREEN,
                  boxShadow: "inset 0 0.14em 0.36em rgb(0 0 0 / 0.65)",
                }}
              >
                <motion.div
                  className="absolute inset-0 flex items-center justify-center gap-[1.04em]"
                  style={{ x: eyeX, y: eyeY }}
                >
                  <Eye
                    side="left"
                    mood={mood}
                    hue={eyeHue}
                    blink={blink}
                    still={still}
                  />
                  <Eye
                    side="right"
                    mood={mood}
                    hue={eyeHue}
                    blink={blink}
                    still={still}
                  />
                </motion.div>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(152deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.05) 34%, rgb(255 255 255 / 0) 34.4%)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* The hands, in front: the backs above the edge, the fingers curled over it. */}
      {[HAND_X, W - HAND_X - HAND_W].map((left) => (
        <motion.div
          key={left}
          className="absolute"
          style={{
            left: `${left}em`,
            top: `${EDGE + GRIP - HAND_H}em`,
            width: `${HAND_W}em`,
            height: `${HAND_H}em`,
            y: handY,
            scaleY: handScale,
            opacity: reach,
            originY: 1,
          }}
        >
          <div
            className="absolute left-1/2 h-[0.4em] w-[1.6em] -translate-x-1/2 rounded-full bg-black/20 blur-[0.16em]"
            style={{ bottom: "-0.18em" }}
          />
          <div className="absolute inset-0 rounded-[0.62em]" style={shell(DROP)}>
            {[0.36, 0.67, 0.98].map((x) => (
              <span
                key={x}
                className="absolute rounded-full"
                style={{
                  left: `${x}em`,
                  top: `${HAND_H - GRIP + 0.06}em`,
                  bottom: "0.2em",
                  width: "0.08em",
                  backgroundColor: "rgb(0 0 0 / 0.13)",
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
})

/**
 * One eye: a lit pill that changes shape with the mood, blinks on its own
 * clock, and gives way to a closed arc when the robot is pleased. While it
 * listens the two pills bounce out of step, like a pair of level meters.
 */
function Eye({
  side,
  mood,
  hue,
  blink,
  still,
}: {
  side: "left" | "right"
  mood: Mood
  hue: string
  blink: MotionValue<number>
  still: boolean
}) {
  const shape = EYES[mood]
  const happy = mood === "happy"
  const metering = mood === "listening" && !still
  const tilt = side === "left" ? shape.tilt : -shape.tilt

  return (
    <motion.div
      className="relative transition-colors duration-300"
      style={{ width: "0.98em", height: "1.5em", color: hue, scaleY: blink }}
    >
      <motion.div
        className="absolute inset-0 rounded-[0.5em]"
        style={{ backgroundColor: "currentColor", boxShadow: GLOW }}
        initial={false}
        animate={
          metering
            ? {
                scaleX: 1,
                scaleY:
                  side === "left" ? [1, 0.42, 1.12, 0.6, 1] : [0.7, 1.12, 0.5, 1, 0.7],
                rotate: 0,
                opacity: 1,
              }
            : {
                scaleX: shape.scaleX,
                scaleY: shape.scaleY,
                rotate: tilt,
                opacity: shape.dim,
              }
        }
        transition={
          metering
            ? {
                duration: side === "left" ? 0.85 : 1.05,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : POP
        }
      />
      <motion.div
        className="absolute left-1/2 h-[0.74em] w-[1.2em] -translate-x-1/2 rounded-t-full border-[0.3em] border-b-0 border-current"
        style={{
          top: "0.24em",
          filter:
            "drop-shadow(0 0 0.28em color-mix(in oklab, currentColor 60%, transparent))",
        }}
        initial={false}
        animate={
          happy
            ? { opacity: 1, y: "0em", scale: 1 }
            : { opacity: 0, y: "0.3em", scale: 0.7 }
        }
        transition={POP}
      />
    </motion.div>
  )
}
