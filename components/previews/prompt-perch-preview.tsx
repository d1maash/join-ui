"use client"

import * as React from "react"
import {
  AppWindow,
  BookOpen,
  CalendarCheck,
  ChefHat,
  Clapperboard,
  CreditCard,
  GalleryHorizontal,
  Hourglass,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  Lightbulb,
  ListOrdered,
  MousePointerClick,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Ticket,
  ToggleRight,
} from "lucide-react"

import {
  PromptPerch,
  type PromptPerchIdeaGroup,
  type PromptPerchOption,
  type PromptPerchSubmission,
} from "@/registry/components/prompt-perch"
import { cn } from "@/lib/utils"

const PAIR =
  "grid grid-cols-1 gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-5"
const ALIGNED = "lg:row-span-2 lg:grid lg:grid-rows-subgrid"

const STROKE = 1.75

const IDEAS: PromptPerchIdeaGroup[] = [
  {
    value: "suggested",
    label: "Suggested",
    icon: <Lightbulb strokeWidth={STROKE} />,
    ideas: [
      {
        label:
          "A developer portfolio with a dark theme, project cards and a contact form",
        icon: <LayoutGrid strokeWidth={STROKE} />,
      },
      {
        label: "A landing page for a time-tracking app, with a live timer in the hero",
        icon: <Hourglass strokeWidth={STROKE} />,
      },
      {
        label: "A homepage for a small coffee roaster, with a subscription box",
        icon: <ShoppingBag strokeWidth={STROKE} />,
      },
    ],
  },
  {
    value: "wireframe",
    label: "Wireframe",
    icon: <LayoutTemplate strokeWidth={STROKE} />,
    ideas: [
      {
        label: "A dashboard with a sidebar, a row of metrics and an activity feed",
        icon: <LayoutDashboard strokeWidth={STROKE} />,
      },
      {
        label: "A three-step sign-up, boxes and labels only",
        icon: <ListOrdered strokeWidth={STROKE} />,
      },
      {
        label: "A long-read article with a sticky table of contents",
        icon: <BookOpen strokeWidth={STROKE} />,
      },
    ],
  },
  {
    value: "apps",
    label: "Apps",
    icon: <Smartphone strokeWidth={STROKE} />,
    ideas: [
      {
        label: "A habit tracker with streaks and a weekly heatmap",
        icon: <CalendarCheck strokeWidth={STROKE} />,
      },
      {
        label: "A banking home screen with cards and recent payments",
        icon: <CreditCard strokeWidth={STROKE} />,
      },
      {
        label: "A recipe app with a hands-free cooking mode",
        icon: <ChefHat strokeWidth={STROKE} />,
      },
      {
        label: "A meditation timer with a breathing guide",
        icon: <Hourglass strokeWidth={STROKE} />,
      },
    ],
  },
  {
    value: "websites",
    label: "Websites",
    icon: <AppWindow strokeWidth={STROKE} />,
    ideas: [
      {
        label: "A studio site with a full-bleed reel and case studies",
        icon: <Clapperboard strokeWidth={STROKE} />,
      },
      {
        label: "A conference site with a schedule, speakers and tickets",
        icon: <Ticket strokeWidth={STROKE} />,
      },
      {
        label: "Product docs with search and a versioned sidebar",
        icon: <BookOpen strokeWidth={STROKE} />,
      },
    ],
  },
  {
    value: "prototype",
    label: "Prototype",
    icon: <MousePointerClick strokeWidth={STROKE} />,
    ideas: [
      {
        label: "A three-screen onboarding you can swipe through",
        icon: <GalleryHorizontal strokeWidth={STROKE} />,
      },
      {
        label: "A checkout flow from cart to confirmation",
        icon: <ShoppingCart strokeWidth={STROKE} />,
      },
      {
        label: "A settings panel whose toggles actually toggle",
        icon: <ToggleRight strokeWidth={STROKE} />,
      },
    ],
  },
]

const STYLES: PromptPerchOption[] = [
  { value: "minimal", label: "Minimal", description: "Quiet type and a lot of air" },
  {
    value: "editorial",
    label: "Editorial",
    description: "Big headlines on a strict grid",
  },
  { value: "brutalist", label: "Brutalist", description: "Raw borders, loud contrast" },
  { value: "soft", label: "Soft", description: "Round corners and pastel washes" },
  {
    value: "technical",
    label: "Technical",
    description: "Mono details and dense data",
  },
]

const MODELS: PromptPerchOption[] = [
  { value: "auto", label: "Auto", description: "Picks a model for each brief" },
  { value: "fast", label: "Fast", description: "First drafts in seconds" },
  { value: "deep", label: "Deep", description: "Slower, and more considered" },
]

const PLACEHOLDERS = [
  "Describe the screen you have in mind",
  "Paste a sketch, or drop a screenshot",
  "A pricing page with three tiers",
  "A weather app that feels like a postcard",
]

export default function PromptPerchPreview() {
  /*
   * The live composer is wired the way an app would wire it: the demo owns
   * the field, so dictation can write into it, and `busy` stands in for the
   * request — set on submit, cleared a few seconds later, or by the stop
   * button.
   */
  const [value, setValue] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [sent, setSent] = React.useState<PromptPerchSubmission | null>(null)
  const dictation = useDictation(value, setValue)

  React.useEffect(() => {
    if (!busy) return
    const id = window.setTimeout(() => setBusy(false), 2800)
    return () => window.clearTimeout(id)
  }, [busy])

  const [mood, setMood] = React.useState<"idle" | "thinking" | "listening">("idle")

  return (
    <div className="flex w-full max-w-5xl flex-col gap-16 font-sans">
      <Panel
        caption="An idea, into a prompt"
        description="Type, and the robot reads along with the caret. Pick an idea and it types itself in. Drop a file on the composer and the eyes go wide. Send, and it hops, then thinks until the work comes back."
      >
        <div className="flex w-full max-w-3xl flex-col gap-3">
          <PromptPerch
            title={
              <>
                Turn your <strong>ideas</strong> into <strong>interfaces</strong>
              </>
            }
            placeholder="What do you want to design?"
            value={value}
            onValueChange={setValue}
            presets={STYLES}
            presetLabel="Design style"
            models={MODELS}
            ideas={IDEAS}
            accept="image/*,.pdf,.fig,.sketch"
            busy={busy}
            onStop={() => setBusy(false)}
            onSubmit={(submission) => {
              setSent(submission)
              setBusy(true)
            }}
            listening={dictation.listening}
            onListeningChange={dictation.supported ? dictation.setListening : undefined}
          />
          <p className="truncate px-1 font-mono text-xs text-muted-foreground">
            {sent ? describe(sent) : "onSubmit — waiting"}
          </p>
        </div>
      </Panel>

      <div className={PAIR}>
        <Panel
          className={ALIGNED}
          caption={
            <>
              No lid, and <Code>placeholder</Code> as a list
            </>
          }
          description="Without a headline the robot perches on the composer itself. A list of placeholders turns over while the field is empty and nobody is in it."
        >
          <PromptPerch placeholder={PLACEHOLDERS} models={MODELS} />
        </Panel>

        <Panel
          className={ALIGNED}
          caption={<Code>companion={"{false}"}</Code>}
          description="The same composer without the robot, for a surface that already has a voice of its own. A single group of ideas draws no tabs."
        >
          <PromptPerch
            companion={false}
            placeholder="Ask for a change to this page"
            presets={STYLES}
            presetLabel="Design style"
            ideas={IDEAS.slice(0, 1)}
            defaultIdeasOpen={false}
          />
        </Panel>
      </div>

      <Panel
        caption={
          <>
            <Code>busy</Code> and <Code>listening</Code>
          </>
        }
        description="The eyes are the only hue the robot spends, and the hue is its state: green at rest, blue while it listens. Thinking, it squints and sweeps, and the lamp on its head pulses; it hops when the work is done."
        aside={
          <div
            role="radiogroup"
            aria-label="Mood"
            className="-mr-1 flex shrink-0 items-center gap-1 rounded-full bg-muted p-1"
          >
            {(["idle", "thinking", "listening"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={mood === item}
                onClick={() => setMood(item)}
                className={cn(
                  "h-7 cursor-pointer rounded-full px-3 text-[0.8125rem] font-medium tracking-[-0.006em] capitalize transition-[background-color,color] duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                  mood === item
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        }
      >
        <div className="w-full max-w-xl">
          <PromptPerch
            placeholder="Say it, or type it"
            peek={false}
            attachments={false}
            busy={mood === "thinking"}
            onStop={() => setMood("idle")}
            listening={mood === "listening"}
            onListeningChange={(next) => setMood(next ? "listening" : "idle")}
          />
        </div>
      </Panel>
    </div>
  )
}

function describe(submission: PromptPerchSubmission) {
  const text =
    submission.text.length > 44 ? `${submission.text.slice(0, 43)}…` : submission.text
  const preset = submission.preset ? `"${submission.preset}"` : "null"
  return `onSubmit({ text: "${text}", files: ${submission.files.length}, preset: ${preset}, model: "${submission.model}" })`
}

/* -------------------------------------------------------------------------- */
/* Dictation, through the Web Speech API where the browser has it.            */
/* -------------------------------------------------------------------------- */

interface Recognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  abort: () => void
  onresult:
    ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type RecognitionConstructor = new () => Recognition

function speech(): RecognitionConstructor | undefined {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}

const subscribeNothing = () => () => {}

/**
 * Voice input for the demo. The composer only says whether it is listening;
 * what listening does is the app's business, and here it writes what the
 * browser hears after whatever was already in the field. Where there is no
 * speech recognition the voice button is simply not drawn.
 */
function useDictation(value: string, setValue: (value: string) => void) {
  const supported = React.useSyncExternalStore(
    subscribeNothing,
    () => Boolean(speech()),
    () => false
  )
  const [listening, setListeningState] = React.useState(false)
  const base = React.useRef("")

  const setListening = React.useCallback(
    (next: boolean) => {
      if (next) base.current = value
      setListeningState(next)
    },
    [value]
  )

  React.useEffect(() => {
    const Constructor = listening ? speech() : undefined
    if (!Constructor) return
    const recognition = new Constructor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || "en-US"
    recognition.onresult = (event) => {
      let heard = ""
      for (let index = 0; index < event.results.length; index += 1) {
        heard += event.results[index]?.[0]?.transcript ?? ""
      }
      const before = base.current.trimEnd()
      setValue(before ? `${before} ${heard.trim()}` : heard.trim())
    }
    recognition.onend = () => setListeningState(false)
    recognition.onerror = () => setListeningState(false)
    try {
      recognition.start()
    } catch {
      /* Already started, or refused — `onerror` and `onend` settle the state. */
    }
    return () => {
      recognition.onend = null
      recognition.onerror = null
      recognition.abort()
    }
  }, [listening, setValue])

  return { supported, listening, setListening }
}

/* -------------------------------------------------------------------------- */
/* Frame                                                                      */
/* -------------------------------------------------------------------------- */

function Panel({
  caption,
  description,
  className,
  aside,
  children,
}: {
  /** A `<Code>` where the caption names an actual prop, plain text otherwise. */
  caption: React.ReactNode
  description: string
  /** Carries `ALIGNED` when the panel is one half of a two-up row. */
  className?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-5", className)}>
      <div className="flex max-w-xl flex-col gap-1.5 px-1">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <span className="text-[1.0625rem] leading-[1.375rem] font-semibold tracking-[-0.022em] text-foreground">
            {caption}
          </span>
          {aside}
        </div>
        <p className="text-[0.9375rem] leading-[1.35rem] tracking-[-0.009em] text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}

/** Mono is reserved for the captions that really are quoting the API. */
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.92em] font-medium text-foreground">
      {children}
    </code>
  )
}
