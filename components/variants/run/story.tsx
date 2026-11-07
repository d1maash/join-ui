"use client"

import * as React from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"
import { AppWindow, ArrowRight, Hexagon, ListTree, Rocket, RotateCcw, ShieldQuestion } from "lucide-react"

import { PROMPTS } from "@/components/previews/fixtures/agent-hive"
import { renderThumb } from "@/components/previews/thumbs/registry"
import { cn } from "@/lib/utils"
import { variantHref } from "@/lib/variants"
import type { AgentHiveModel, AgentHiveRun } from "@/registry/components/agent-hive"
import type { ApprovalGateDecision } from "@/registry/components/approval-gate"

import { AskGate, MODELS, OutputPage, PickPane, ShipPane, WorkPane, type PaneSize } from "./panes"
import {
  BRANCH,
  CAST,
  CAST_START,
  CHAPTERS,
  CHOSEN_MODEL,
  DECISION_LINE,
  PICK_PATH,
  RUN_NO,
  SITE,
  TASK,
  shipActive,
  traceSteps,
  workBeat,
  type ChapterId,
  type Decision,
} from "./script"
import { setRunTone, TONE_COLOR, TONE_LABEL, useMedia, useReducedMotionSafe, type RunTone } from "./state"
import { MiniWindow, RunWindow } from "./window"

const href = (path: string) => variantHref("run", path)
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const EASE = [0.32, 0.72, 0, 1] as const

/* ─── The run's state, shared by both layouts ─────────────────────────────── */

const SEED: AgentHiveRun = {
  id: "seed",
  prompt: "Fix the flaky checkout test",
  modelId: "quartz",
  state: "done",
}

interface StoryModel {
  decision: Decision
  decide: (decision: ApprovalGateDecision) => void
  attempt: number
  askAgain: () => void
  userModel: string | null
  setUserModel: (id: string) => void
  extra: AgentHiveRun[]
  generate: (model: AgentHiveModel) => void
}

function useStoryModel(): StoryModel {
  const [decision, setDecision] = React.useState<Decision>(null)
  const [attempt, setAttempt] = React.useState(0)
  const [userModel, setUserModel] = React.useState<string | null>(null)
  const [extra, setExtra] = React.useState<AgentHiveRun[]>([])
  const timers = React.useRef<number[]>([])
  const counter = React.useRef(0)

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const generate = React.useCallback((model: AgentHiveModel) => {
    counter.current += 1
    const id = `yours-${counter.current}`
    const prompt = PROMPTS[(counter.current - 1) % PROMPTS.length] ?? TASK
    setExtra((current) =>
      [{ id, prompt, modelId: model.id, state: "working" as const }, ...current].slice(0, 2)
    )
    timers.current.push(
      window.setTimeout(() => {
        setExtra((current) =>
          current.map((run) => (run.id === id ? { ...run, state: "done" as const } : run))
        )
      }, 3200)
    )
  }, [])

  const decide = React.useCallback((next: ApprovalGateDecision) => {
    setDecision((current) => current ?? next)
  }, [])

  const askAgain = React.useCallback(() => {
    setDecision(null)
    setAttempt((value) => value + 1)
  }, [])

  return { decision, decide, attempt, askAgain, userModel, setUserModel, extra, generate }
}

/** Where the run stands. `chapter` is -1 before it starts and 5 for the cast. */
interface Phase {
  chapter: number
  pickBeat: number
  workBeat: number
  shipActive: number
}

const IDLE: Phase = { chapter: -1, pickBeat: 0, workBeat: 0, shipActive: 0 }

function local(p: number, index: number) {
  const chapter = CHAPTERS[index]!
  return clamp01((p - chapter.start) / (chapter.end - chapter.start))
}

function pickBeatAt(t: number, started: boolean) {
  if (!started) return 0
  return t < 0.2 ? 0 : t < 0.4 ? 1 : t < 0.6 ? 2 : 3
}

function phaseAt(p: number): Phase {
  let chapter = -1
  CHAPTERS.forEach((entry, index) => {
    if (p >= entry.start) chapter = index
  })
  if (p >= CAST_START) chapter = 5
  return {
    chapter,
    pickBeat: chapter > 0 ? 3 : pickBeatAt(local(p, 0), chapter === 0),
    workBeat: chapter < 1 ? 0 : chapter > 1 ? 8 : workBeat(local(p, 1)),
    shipActive: chapter < 3 ? 0 : chapter > 3 ? 4 : shipActive(local(p, 3)),
  }
}

function samePhase(a: Phase, b: Phase) {
  return (
    a.chapter === b.chapter &&
    a.pickBeat === b.pickBeat &&
    a.workBeat === b.workBeat &&
    a.shipActive === b.shipActive
  )
}

function toneFor(phase: Phase, decision: Decision): RunTone {
  if (phase.chapter >= 4 || (phase.chapter === 3 && phase.shipActive >= 4)) return "shipped"
  if (phase.chapter === 2) {
    if (decision === null) return "waiting"
    if (decision === "deny") return "denied"
    return "running"
  }
  if (phase.chapter >= 1 || phase.pickBeat >= 3) return "running"
  return "idle"
}

function modelFor(phase: Phase, userModel: string | null) {
  return userModel ?? PICK_PATH[Math.min(phase.pickBeat, PICK_PATH.length - 1)] ?? CHOSEN_MODEL
}

function runsFor(phase: Phase, model: string, extra: AgentHiveRun[], shipped: boolean) {
  const runs: AgentHiveRun[] = [...extra]
  if (phase.pickBeat >= 3) {
    runs.push({ id: "run-148", prompt: TASK, modelId: model, state: shipped ? "done" : "working" })
  }
  runs.push(SEED)
  return runs
}

/* ─── Shared window furniture ─────────────────────────────────────────────── */

const SIDEBAR: Array<{ id: ChapterId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "pick", label: "Models", icon: Hexagon },
  { id: "work", label: "Trace", icon: ListTree },
  { id: "ask", label: "Approvals", icon: ShieldQuestion },
  { id: "ship", label: "Deploys", icon: Rocket },
  { id: "output", label: "Preview", icon: AppWindow },
]

const EARLIER = [
  { title: "Fix the flaky checkout test", tone: "shipped" as const },
  { title: "Move auth to the app router", tone: "shipped" as const },
  { title: "Rename the Button variants", tone: "denied" as const },
]

function WindowSidebar({
  active,
  waiting,
  onJump,
}: {
  active: number
  waiting: boolean
  onJump: (index: number) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-white/[0.1] text-[10px] font-semibold text-[#f5f5f7]">
          L
        </span>
        <span className="text-[13px] font-medium text-[#f5f5f7]">lumen/web</span>
      </div>

      <p className="px-2 pb-1 text-[11px] font-medium text-[#77777c]">{RUN_NO}</p>
      <ul className="flex flex-col gap-px">
        {SIDEBAR.map((item, index) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                type="button"
                className="run-side-item"
                aria-current={active === index ? "step" : undefined}
                onClick={() => onJump(index)}
                aria-label={`${item.label} — go to chapter ${index + 1}`}
              >
                <Icon />
                <span className="flex-1">{item.label}</span>
                {item.id === "ask" && waiting ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffb340]/15 px-1 text-[10px] font-semibold text-[#ffb340]">
                    1
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 px-2 pb-1 text-[11px] font-medium text-[#77777c]">Earlier</p>
      <ul className="flex flex-col gap-px" aria-label="Earlier runs">
        {EARLIER.map((run) => (
          <li
            key={run.title}
            className="flex h-[1.75rem] items-center gap-2 px-2 text-[12px] text-[#77777c]"
          >
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: TONE_COLOR[run.tone] }}
            />
            <span className="truncate">{run.title}</span>
            <span className="sr-only">{run.tone === "shipped" ? "Shipped" : "Denied"}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WindowToolbar({
  title,
  tone,
  model,
  compact = false,
}: {
  title: string
  tone: RunTone
  model: string
  compact?: boolean
}) {
  const current = MODELS.find((entry) => entry.id === model)
  return (
    <>
      <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span className="truncate text-[13px] font-medium text-[#f5f5f7]">{title}</span>
        {compact ? null : (
          <span className="hidden truncate font-mono text-[11px] text-[#77777c] xl:inline">
            {BRANCH}
          </span>
        )}
      </div>
      <span className="run-chip" data-tone={tone}>
        <i aria-hidden="true" />
        {TONE_LABEL[tone]}
      </span>
      {compact || !current ? null : (
        <span className="flex h-[1.375rem] shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] pr-2.5 pl-1.5 text-[12px] text-[#c7c7cc]">
          <span className="size-3.5 text-[#c7c7cc] [&_svg]:size-full" aria-hidden="true">
            {current.icon}
          </span>
          {current.label}
        </span>
      )}
    </>
  )
}

/** The caption's links: the component that performed the chapter. */
function CaptionLinks({ chapter }: { chapter: ChapterId }) {
  const links =
    chapter === "output"
      ? [
          { slug: "glass-crest", title: "Glass Crest" },
          { slug: "carbon-copy", title: "Carbon Copy" },
          { slug: "focus-stack", title: "Focus Stack" },
        ]
      : CHAPTERS.filter((entry) => entry.id === chapter).map((entry) => ({
          slug: entry.slug,
          title: entry.component,
        }))
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {links.map((link) => (
        <li key={link.slug}>
          <Link href={href(`/components/${link.slug}`)} className="run-link text-[15px]">
            {link.title}
            <ArrowRight aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function AskControls({
  decision,
  onDecide,
  onAgain,
}: {
  decision: Decision
  onDecide: (decision: ApprovalGateDecision) => void
  onAgain: () => void
}) {
  if (decision === null) {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[15px] text-[#8b8b90]">
        <span className="flex items-center gap-2.5">
          <button
            type="button"
            className="run-key run-key--lg"
            onClick={() => onDecide("allow")}
            aria-label="Allow (Y)"
          >
            Y
          </button>
          to allow
        </span>
        <span className="flex items-center gap-2.5">
          <button
            type="button"
            className="run-key run-key--lg"
            onClick={() => onDecide("deny")}
            aria-label="Deny (N)"
          >
            N
          </button>
          to deny
        </span>
      </div>
    )
  }
  const line = DECISION_LINE[decision]
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="run-lede" aria-live="polite">
        <strong>{line.lead}</strong> {line.body}
      </p>
      <button type="button" className="run-btn run-btn--ghost run-btn--sm -ml-2.5" onClick={onAgain}>
        <RotateCcw aria-hidden="true" />
        Ask again
      </button>
    </div>
  )
}

/* ─── The pinned stage (wide screens) ─────────────────────────────────────── */

interface Geometry {
  vw: number
  vh: number
  storyTop: number
  storyHeight: number
  win: { x: number; y: number; w: number; h: number }
  caption: { x: number; w: number }
  centerDx: number
  liftY: number
  cast: {
    headY: number
    slots: Array<{ x: number; y: number; w: number; h: number }>
    recap: { x: number; y: number; w: number; h: number }
  }
  compact: boolean
}

const TOP = 56

function measure(vw: number, vh: number, storyTop: number, storyHeight: number): Geometry {
  const pad = Math.min(80, Math.max(16, vw * 0.055))
  const areaW = Math.min(1280, vw - pad * 2)
  const areaX = (vw - areaW) / 2
  const capW = Math.min(352, areaW * 0.28)
  const gap = Math.max(40, areaW * 0.045)

  const maxH = Math.min(640, vh - TOP - 80)
  let w = Math.min(980, areaW - capW - gap)
  let h = w / 1.5
  if (h > maxH) {
    h = maxH
    w = h * 1.5
  }
  const x = areaX + areaW - w
  const y = TOP + (vh - TOP - h) / 2 - 6

  const colGap = 20
  const colW = (areaW - colGap * 3) / 4
  const slotH = colW / 1.5
  const labelH = 46
  const rowGap = 26
  const headH = vh > 820 ? 132 : 112
  const total = headH + (slotH + labelH) * 2 + rowGap
  const headY = TOP + Math.max(20, (vh - TOP - 56 - total) / 2)
  const slotsTop = headY + headH
  const rect = (col: number, row: number) => ({
    x: areaX + col * (colW + colGap),
    y: slotsTop + row * (slotH + labelH + rowGap),
    w: colW,
    h: slotH,
  })
  const slots = CAST.map((_, index) => (index < 4 ? rect(index, 0) : rect(index - 4, 1)))

  return {
    vw,
    vh,
    storyTop,
    storyHeight,
    win: { x, y, w, h },
    caption: { x: areaX, w: capW },
    centerDx: vw / 2 - (x + w / 2),
    liftY: -(y - TOP - 40),
    cast: { headY, slots, recap: rect(3, 1) },
    compact: h < 560,
  }
}

function PinnedStory({ m }: { m: StoryModel }) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const geoRef = React.useRef<Geometry | null>(null)
  const browserMax = React.useRef(0)
  const [geo, setGeo] = React.useState<Geometry | null>(null)
  const [phase, setPhase] = React.useState<Phase>(IDLE)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] })

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rotateX = useMotionValue(0)
  const winOpacity = useMotionValue(1)
  const captions = useMotionValue(0)
  const castT = useMotionValue(0)
  const browserY = useMotionValue(0)

  const update = React.useCallback(() => {
    const g = geoRef.current
    if (!g) return
    const sy = window.scrollY
    const p = scrollYProgress.get()
    const e = easeOut(clamp01(sy / Math.max(1, g.storyTop)))
    const c = clamp01((p - CAST_START) / (1 - CAST_START))
    const k = easeInOut(clamp01(c / 0.5))
    const target = g.cast.slots[4]!

    x.set((1 - e) * g.centerDx + k * (target.x - g.win.x))
    y.set((1 - e) * g.liftY + k * (target.y - g.win.y))
    rotateX.set((1 - e) * 20)
    scale.set(1 + k * (target.w / g.win.w - 1))
    winOpacity.set(1 - clamp01((c - 0.44) / 0.12))
    castT.set(c)
    captions.set(clamp01((e - 0.85) / 0.15) * (1 - clamp01(c / 0.14)))

    const out = local(p, 4)
    browserY.set(-easeInOut(clamp01((out - 0.38) / 0.42)) * browserMax.current)

    const next = phaseAt(p)
    setPhase((current) => (samePhase(current, next) ? current : next))
  }, [browserY, captions, castT, rotateX, scale, scrollYProgress, winOpacity, x, y])

  React.useLayoutEffect(() => {
    const stage = stageRef.current
    const section = sectionRef.current
    if (!stage || !section) return
    const remeasure = () => {
      const rect = section.getBoundingClientRect()
      const next = measure(
        stage.clientWidth,
        stage.clientHeight,
        rect.top + window.scrollY,
        section.offsetHeight
      )
      geoRef.current = next
      setGeo(next)
      update()
    }
    remeasure()
    const observer = new ResizeObserver(remeasure)
    observer.observe(stage)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [update])

  useMotionValueEvent(scrollYProgress, "change", update)
  React.useEffect(() => {
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [update])

  /* Scrolling past the question without answering it is an answer too. */
  const { decision, decide } = m
  React.useEffect(() => {
    if (phase.chapter > 2 && decision === null) decide("expire")
  }, [phase.chapter, decision, decide])

  const tone = toneFor(phase, decision)
  React.useEffect(() => setRunTone(tone), [tone])
  React.useEffect(() => () => setRunTone("idle"), [])

  const jump = React.useCallback((index: number) => {
    const g = geoRef.current
    if (!g) return
    const chapter = index >= 5 ? null : CHAPTERS[index]
    const at = chapter
      ? chapter.start + (chapter.end - chapter.start) * (chapter.id === "ask" ? 0.25 : 0.62)
      : CAST_START + (1 - CAST_START) * 0.8
    const top = g.storyTop + at * (g.storyHeight - g.vh)
    window.scrollTo({ top, behavior: "smooth" })
  }, [])

  const onBrowserMeasure = React.useCallback((max: number) => {
    browserMax.current = max
  }, [])

  const model = modelFor(phase, m.userModel)
  const shipped = tone === "shipped"
  const runs = runsFor(phase, model, m.extra, shipped)
  const safePath = decision === "deny" || decision === "expire"
  const chapter = phase.chapter
  const asking = chapter === 2
  const size: PaneSize = geo?.compact ? "sm" : "md"
  const steps = traceSteps(phase.workBeat, decision, asking)
  const active = CHAPTERS[Math.max(0, Math.min(4, chapter))]!

  return (
    <section
      ref={sectionRef}
      aria-label="One agent run, start to finish"
      className="run-story"
      style={{ height: "780vh" }}
    >
      <div ref={stageRef} className="run-stage">
        {geo ? (
          <>
            {/* The captions — the left column of the stage. */}
            <motion.div
              className="run-captions flex flex-col justify-center"
              style={{
                left: geo.caption.x,
                width: geo.caption.w,
                top: geo.win.y,
                height: geo.win.h,
                opacity: captions,
              }}
              onFocus={() => {
                if (chapter < 0) jump(0)
              }}
            >
              <nav aria-label="Chapters">
                <ol className="run-chapters">
                  {CHAPTERS.map((entry, index) => (
                    <li key={entry.id}>
                      <ChapterTab
                        index={index}
                        no={entry.no}
                        name={entry.name}
                        current={chapter === index}
                        progress={scrollYProgress}
                        onSelect={() => jump(index)}
                      />
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="relative mt-9 min-h-[15rem]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.08, ease: EASE } }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } }}
                    className="absolute inset-x-0 top-0 flex flex-col gap-6"
                  >
                    <p className="run-lede">
                      <strong>{active.lead}</strong> {active.body}
                    </p>
                    {active.id === "ask" ? (
                      <AskControls decision={decision} onDecide={decide} onAgain={m.askAgain} />
                    ) : null}
                    <CaptionLinks chapter={active.id} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* The cast — revealed when the camera pulls back. */}
            <Cast
              geo={geo}
              castT={castT}
              mounted={chapter >= 4}
              decision={decision}
              model={model}
              onFocus={() => {
                if (chapter < 5) jump(5)
              }}
            />

            {/* The window. */}
            <motion.div
              className="run-window-slot"
              style={{
                left: geo.win.x,
                top: geo.win.y,
                width: geo.win.w,
                height: geo.win.h,
                x,
                y,
                scale,
                rotateX,
                opacity: winOpacity,
                transformPerspective: 1800,
                transformOrigin: "0% 0%",
              }}
            >
              <div
                aria-hidden="true"
                className="run-bloom"
                style={{ "--run-state": TONE_COLOR[tone] } as React.CSSProperties}
              />
              <RunWindow
                label="Agent run"
                mode={chapter >= 4 ? "browser" : "app"}
                url={SITE.url}
                className="size-full"
                sidebar={
                  <WindowSidebar
                    active={Math.max(0, Math.min(4, chapter))}
                    waiting={tone === "waiting"}
                    onJump={jump}
                  />
                }
                toolbar={
                  <WindowToolbar
                    title={phase.pickBeat >= 3 ? TASK : "New run"}
                    tone={tone}
                    model={model}
                  />
                }
              >
                <Layer show={chapter <= 0}>
                  <PickPane
                    model={model}
                    onModel={m.setUserModel}
                    runs={runs}
                    onGenerate={m.generate}
                    size={size}
                  />
                </Layer>
                <Layer show={chapter === 1 || chapter === 2} dim={asking}>
                  <WorkPane steps={steps} size={size} />
                </Layer>
                <AnimatePresence>
                  {asking ? (
                    <motion.div
                      key="sheet"
                      className="absolute top-0 left-1/2 z-10 w-[min(33rem,88%)]"
                      initial={{ y: "-105%", x: "-50%" }}
                      animate={{ y: 0, x: "-50%" }}
                      exit={{ y: "-105%", x: "-50%" }}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      <AskGate
                        key={m.attempt}
                        decision={decision}
                        onDecision={decide}
                        hotkeys={decision === null ? "global" : "off"}
                        size={size}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Layer show={chapter === 3}>
                  <ShipPane active={phase.shipActive} safePath={safePath} size={size} />
                </Layer>
                <Layer show={chapter >= 4}>
                  {chapter >= 4 ? (
                    <MeasuredOutput
                      browserY={browserY}
                      onMeasure={onBrowserMeasure}
                    />
                  ) : null}
                </Layer>
              </RunWindow>
            </motion.div>
          </>
        ) : null}
      </div>
    </section>
  )
}

function Layer({
  show,
  dim = false,
  children,
}: {
  show: boolean
  dim?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{
        opacity: show ? (dim ? 0.28 : 1) : 0,
        scale: show ? (dim ? 0.985 : 1) : 0.99,
        y: show ? 0 : 6,
      }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ pointerEvents: show && !dim ? "auto" : "none" }}
      inert={!show || dim || undefined}
      aria-hidden={!show || undefined}
    >
      {children}
    </motion.div>
  )
}

function MeasuredOutput({
  browserY,
  onMeasure,
}: {
  browserY: MotionValue<number>
  onMeasure: (max: number) => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [live, setLive] = React.useState(false)

  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const inner = node.firstElementChild?.firstElementChild as HTMLElement | null
    const read = () => onMeasure(Math.max(0, (inner?.scrollHeight ?? 0) - node.clientHeight))
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    if (inner) observer.observe(inner)
    return () => observer.disconnect()
  }, [onMeasure])

  /* The second headline sets itself once the page has scrolled to it. */
  useMotionValueEvent(browserY, "change", (value) => {
    if (!live && value < -120) setLive(true)
  })

  return (
    <div ref={ref} className="absolute inset-0">
      <OutputPage scroll={browserY} size="md" live={live} />
    </div>
  )
}

function ChapterTab({
  index,
  no,
  name,
  current,
  progress,
  onSelect,
}: {
  index: number
  no: string
  name: string
  current: boolean
  progress: MotionValue<number>
  onSelect: () => void
}) {
  const chapter = CHAPTERS[index]!
  const fill = useTransform(progress, [chapter.start, chapter.end], [0, 1], { clamp: true })
  return (
    <button
      type="button"
      className="run-chapter-tab"
      aria-current={current ? "step" : undefined}
      onClick={onSelect}
    >
      <span className="run-index text-current opacity-80">{no}</span>
      <span>{name}</span>
      <i aria-hidden="true">
        <motion.b style={{ scaleX: fill }} />
      </i>
    </button>
  )
}

/* ─── The cast ────────────────────────────────────────────────────────────── */

function decisionWord(decision: Decision) {
  if (decision === "allow") return "Allowed by you"
  if (decision === "deny") return "Denied by you"
  if (decision === "expire") return "Expired — safe path"
  return "Waiting"
}

function Recap({ decision, model }: { decision: Decision; model: string }) {
  const label = MODELS.find((entry) => entry.id === model)?.label ?? "Nimbus 2"
  const rows = [
    ["Model", label],
    ["Tool calls", decision === "allow" ? "5" : "6"],
    ["Approval", decisionWord(decision)],
    ["Deploy", "4 of 4 · 2m 03s"],
    ["Live at", SITE.url],
  ]
  return (
    <div className="flex h-full flex-col rounded-[10px] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <p className="flex items-center gap-2 text-[13px] font-medium text-[#f5f5f7]">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[#30d158]" />
        {RUN_NO} — shipped
      </p>
      <dl className="mt-auto flex flex-col gap-1.5 text-[12px]">
        {rows.map(([term, value]) => (
          <div key={term} className="flex justify-between gap-3">
            <dt className="text-[#77777c]">{term}</dt>
            <dd className="truncate text-right text-[#c7c7cc]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Cast({
  geo,
  castT,
  mounted,
  decision,
  model,
  onFocus,
}: {
  geo: Geometry
  castT: MotionValue<number>
  mounted: boolean
  decision: Decision
  model: string
  onFocus: () => void
}) {
  const head = useTransform(castT, [0.1, 0.32], [0, 1])
  const headY = useTransform(castT, [0.1, 0.32], [12, 0])
  const recap = useTransform(castT, [0.55, 0.75], [0, 1])
  const live = useTransform(castT, (value) => (value > 0.02 ? "auto" : "none"))

  return (
    <motion.div className="absolute inset-0" style={{ pointerEvents: live }} onFocus={onFocus}>
      <motion.h2
        className="absolute max-w-[40rem] text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.022em] text-balance"
        style={{
          left: geo.caption.x,
          top: geo.cast.headY,
          opacity: head,
          y: headY,
        }}
      >
        Seven components ran that.{" "}
        <span className="text-[#8b8b90]">In order of appearance.</span>
      </motion.h2>

      <ul>
        {CAST.map((item, index) => (
          <CastSlot
            key={item.slug}
            index={index}
            item={item}
            rect={geo.cast.slots[index]!}
            castT={castT}
            mounted={mounted}
          />
        ))}
      </ul>

      <motion.div
        className="absolute"
        style={{
          left: geo.cast.recap.x,
          top: geo.cast.recap.y,
          width: geo.cast.recap.w,
          height: geo.cast.recap.h,
          opacity: recap,
        }}
      >
        <Recap decision={decision} model={model} />
      </motion.div>
    </motion.div>
  )
}

function CastSlot({
  index,
  item,
  rect,
  castT,
  mounted,
}: {
  index: number
  item: (typeof CAST)[number]
  rect: { x: number; y: number; w: number; h: number }
  castT: MotionValue<number>
  mounted: boolean
}) {
  /* The one the window lands in is there first, under it; the rest arrive around it. */
  const isLanding = index === 4
  const order = [0.2, 0.25, 0.3, 0.35, 0.3, 0.4, 0.45][index] ?? 0.3
  const opacity = useTransform(
    castT,
    isLanding ? [0.38, 0.46] : [order, order + 0.16],
    [0, 1]
  )
  const y = useTransform(castT, [order, order + 0.2], [isLanding ? 0 : 18, 0])
  const label = useTransform(castT, [0.5, 0.66], [0, 1])
  const barH = 28
  const scale = Math.min(rect.w / 480, (rect.h - barH) / 320)

  return (
    <motion.li
      className="absolute"
      style={{ left: rect.x, top: rect.y, width: rect.w, opacity, y }}
    >
      <Link href={href(`/components/${item.slug}`)} className="group block rounded-[12px]">
        <MiniWindow title={item.title} className="w-full" >
          <div
            className="run-thumb-frame dark bg-background"
            style={{ height: rect.h - barH, "--run-thumb-scale": scale } as React.CSSProperties}
            inert
            aria-hidden="true"
          >
            <div>{mounted ? renderThumb(item.slug) : null}</div>
          </div>
        </MiniWindow>
        <motion.span className="mt-3 flex items-baseline justify-between gap-3" style={{ opacity: label }}>
          <span className="text-[15px] font-medium text-[#f5f5f7] group-hover:underline group-hover:underline-offset-4">
            {item.title}
          </span>
          <span className="run-index">{item.chapter}</span>
        </motion.span>
      </Link>
    </motion.li>
  )
}

/* ─── The stacked sequence (narrow screens, reduced motion) ───────────────── */

function StackedStory({ m, still }: { m: StoryModel; still: boolean }) {
  const [shipSeen, setShipSeen] = React.useState(false)
  const { decision, decide } = m

  React.useEffect(() => {
    if (shipSeen && decision === null) decide("expire")
  }, [shipSeen, decision, decide])

  React.useEffect(() => () => setRunTone("idle"), [])

  return (
    <section aria-label="One agent run, start to finish" className="run-container pt-6 pb-8">
      <div className="flex flex-col gap-20 md:gap-28">
        {CHAPTERS.map((chapter) => (
          <StackedChapter
            key={chapter.id}
            id={chapter.id}
            m={m}
            still={still}
            onShip={() => setShipSeen(true)}
          />
        ))}
      </div>
      <StackedCast decision={decision} />
    </section>
  )
}

function StackedChapter({
  id,
  m,
  still,
  onShip,
}: {
  id: ChapterId
  m: StoryModel
  still: boolean
  onShip: () => void
}) {
  const chapter = CHAPTERS.find((entry) => entry.id === id)!
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] })
  const [t, setT] = React.useState(still ? 1 : 0)
  const wide = useMedia("(min-width: 768px)", false)
  const size: PaneSize = wide ? "md" : "sm"

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (still) return
    const next = Math.round(clamp01(value) * 40) / 40
    setT((current) => (current === next ? current : next))
  })

  React.useEffect(() => {
    if (id === "ship" && t > 0.05) onShip()
  }, [id, t, onShip])

  const { decision } = m
  const pickBeat = id === "pick" ? pickBeatAt(t, true) : 3
  const phase: Phase = {
    chapter: CHAPTERS.indexOf(chapter),
    pickBeat,
    workBeat: id === "work" ? workBeat(t) : 8,
    shipActive: id === "ship" ? shipActive(t) : 4,
  }
  const tone = toneFor(phase, decision)
  const model = modelFor(phase, m.userModel)
  const runs = runsFor(phase, model, m.extra, false)

  React.useEffect(() => {
    if (!still && t > 0 && t < 1) setRunTone(tone)
  }, [still, t, tone])

  return (
    <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
      <div className="flex flex-col gap-5">
        <p className="run-index">
          {chapter.no} <span className="ml-1.5 text-[#f5f5f7]">{chapter.name}</span>
        </p>
        <p className="run-lede">
          <strong>{chapter.lead}</strong> {chapter.body}
        </p>
        {id === "ask" ? (
          <AskControls decision={decision} onDecide={m.decide} onAgain={m.askAgain} />
        ) : null}
        <CaptionLinks chapter={id} />
      </div>

      <div ref={ref} className="relative">
        <div
          aria-hidden="true"
          className="run-bloom"
          style={{ "--run-state": TONE_COLOR[tone], inset: "-15% -10%" } as React.CSSProperties}
        />
        <RunWindow
          label={`${chapter.name}: ${chapter.component}`}
          mode={id === "output" ? "browser" : "app"}
          url={SITE.url}
          flat
          toolbar={
            <WindowToolbar
              title={pickBeat >= 3 ? TASK : "New run"}
              tone={tone}
              model={model}
              compact={!wide}
            />
          }
          className={cn(
            "w-full",
            id === "pick" && (wide ? "h-[34rem]" : "h-[30rem]"),
            id === "ship" && (wide ? "h-[30rem]" : "")
          )}
        >
          {id === "pick" ? (
            <PickPane
              model={model}
              onModel={m.setUserModel}
              runs={runs}
              onGenerate={m.generate}
              size={size}
            />
          ) : null}
          {id === "work" ? <WorkPane steps={traceSteps(phase.workBeat, decision, false)} size={size} /> : null}
          {id === "ask" ? (
            <div className={cn("flex justify-center", wide ? "px-8 pt-0 pb-8" : "px-3 pb-4")}>
              <div className="w-full max-w-[33rem]">
                <AskGate
                  key={m.attempt}
                  decision={decision}
                  onDecision={m.decide}
                  hotkeys="focus"
                  size={size}
                />
              </div>
            </div>
          ) : null}
          {id === "ship" ? (
            <ShipPane
              active={phase.shipActive}
              safePath={decision === "deny" || decision === "expire"}
              size={size}
            />
          ) : null}
          {id === "output" ? <OutputPage size={size} live={still || t > 0.3} /> : null}
        </RunWindow>
      </div>
    </div>
  )
}

function StackedCast({ decision }: { decision: Decision }) {
  return (
    <div className="mt-24 md:mt-32">
      <h2 className="max-w-[40rem] text-[clamp(1.75rem,5vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.022em] text-balance">
        Seven components ran that.{" "}
        <span className="text-[#8b8b90]">In order of appearance.</span>
      </h2>
      <ul className="-mx-[var(--run-pad)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--run-pad)] pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
        {CAST.map((item) => (
          <li key={item.slug} className="w-[17rem] shrink-0 snap-start lg:w-auto">
            <Link href={href(`/components/${item.slug}`)} className="group block rounded-[12px]">
              <MiniWindow title={item.title}>
                <div
                  className="run-thumb-frame dark bg-background"
                  style={{ height: 172, "--run-thumb-scale": 0.54 } as React.CSSProperties}
                  inert
                  aria-hidden="true"
                >
                  <div>{renderThumb(item.slug)}</div>
                </div>
              </MiniWindow>
              <span className="mt-3 flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-medium text-[#f5f5f7]">{item.title}</span>
                <span className="run-index">{item.chapter}</span>
              </span>
            </Link>
          </li>
        ))}
        <li className="hidden lg:block">
          <div className="aspect-[3/2]">
            <Recap decision={decision} model={CHOSEN_MODEL} />
          </div>
        </li>
      </ul>
    </div>
  )
}

/* ─── Entry ───────────────────────────────────────────────────────────────── */

export function RunStory() {
  const m = useStoryModel()
  const wide = useMedia("(min-width: 1024px) and (min-height: 620px)", true)
  const still = useReducedMotionSafe()
  return wide && !still ? <PinnedStory m={m} /> : <StackedStory m={m} still={still} />
}
