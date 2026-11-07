"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { COMPONENT_SLUGS, isComponentSlug, type ComponentSlug } from "../apps"
import { useStill } from "../hooks"

type Line =
  | { kind: "prompt"; text: string }
  | { kind: "out" | "ok" | "path" | "muted" | "err"; text: string }

const CWD = "~/acme-app"
const INSTALL = "pnpm dlx shadcn@latest add @joinui/approval-gate"

function installOutput(slug: string): Line[] {
  return [
    { kind: "ok", text: "✔ Checking registry." },
    { kind: "ok", text: "✔ Installing dependencies." },
    { kind: "ok", text: "✔ Created 1 file:" },
    { kind: "path", text: `  - components/joinui/${slug}.tsx` },
  ]
}

const LOGIN: Line = { kind: "muted", text: "Last login: Sun 8 Nov 09:41 on ttys002" }
const FINISHED: Line[] = [LOGIN, { kind: "prompt", text: INSTALL }, ...installOutput("approval-gate")]

/* The script plays once per visit, not every time the desktop comes back. */
let played = false

/** Whether the install has already played this visit — the desktop puts its file back. */
export function terminalPlayed() {
  return played
}

/*
 * Terminal.
 *
 * It opens on the one command the library is installed with and types it,
 * then prints what the shadcn CLI really prints: the file lands in your
 * project, as source. After that the prompt is yours — `ls`, `add`, `open`,
 * `help`, `clear` — so the toy keeps working when you poke it.
 */
export function TerminalScene({
  onInstalled,
  onOpen,
  autoplay = true,
  className,
}: {
  onInstalled?: () => void
  /** Opens a component's window, for the `open` command. */
  onOpen?: (slug: ComponentSlug) => void
  autoplay?: boolean
  className?: string
}) {
  const still = useStill()
  const [scripted] = React.useState(() => played || !autoplay)
  const [lines, setLines] = React.useState<Line[]>(() => (scripted ? FINISHED : [LOGIN]))
  const [typed, setTyped] = React.useState("")
  const [ready, setReady] = React.useState(scripted)
  const [value, setValue] = React.useState("")
  const [history, setHistory] = React.useState<string[]>([])
  const [cursor, setCursor] = React.useState(-1)
  const scroller = React.useRef<HTMLDivElement>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const installed = React.useRef(onInstalled)

  React.useEffect(() => {
    installed.current = onInstalled
  })

  /* The scripted install. */
  React.useEffect(() => {
    if (scripted) {
      installed.current?.()
      return
    }
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    if (still) {
      at(0, () => {
        setLines(FINISHED)
        setReady(true)
        played = true
        installed.current?.()
      })
      return () => timers.forEach(window.clearTimeout)
    }

    let t = 450
    for (let i = 1; i <= INSTALL.length; i++) {
      /* A little unevenness, so it reads as typed rather than printed. */
      t += INSTALL[i - 1] === " " ? 60 : 16 + ((i * 37) % 19)
      at(t, () => setTyped(INSTALL.slice(0, i)))
    }
    t += 300
    at(t, () => {
      setTyped("")
      setLines((current) => [...current, { kind: "prompt", text: INSTALL }])
    })
    const output = installOutput("approval-gate")
    output.forEach((line, index) => {
      t += index === 2 ? 420 : 240
      at(t, () => setLines((current) => [...current, line]))
    })
    t += 200
    at(t, () => {
      setReady(true)
      played = true
      installed.current?.()
    })
    return () => {
      timers.forEach(window.clearTimeout)
      setTyped("")
      setLines([LOGIN])
    }
  }, [scripted, still])

  React.useEffect(() => {
    const node = scroller.current
    if (node) node.scrollTop = node.scrollHeight
  }, [lines, typed, ready])

  function run(raw: string) {
    const command = raw.trim()
    const echo: Line = { kind: "prompt", text: raw }
    if (!command) {
      setLines((current) => [...current, echo])
      return
    }
    setHistory((current) => [...current, command])
    setCursor(-1)
    const [head, ...rest] = command.split(/\s+/)
    const arg = rest.at(-1)?.replace(/^@joinui\//, "") ?? ""

    if (head === "clear") {
      setLines([])
      return
    }
    let out: Line[]
    switch (head) {
      case "help":
        out = [
          { kind: "out", text: "ls              list the components in the registry" },
          { kind: "out", text: "add <name>      install one, the way the CLI does" },
          { kind: "out", text: "open <name>     open its window on the desktop" },
          { kind: "out", text: "clear           clear the screen" },
        ]
        break
      case "ls":
        out = [{ kind: "path", text: COMPONENT_SLUGS.join("   ") }]
        break
      case "add":
      case "pnpm":
      case "npx":
      case "bunx":
      case "yarn":
        out = isComponentSlug(arg)
          ? installOutput(arg)
          : [{ kind: "err", text: `✖ "${arg || "?"}" is not in the @joinui registry. Try ls.` }]
        break
      case "open":
        if (isComponentSlug(arg)) {
          onOpen?.(arg)
          out = [{ kind: "muted", text: `Opening ${arg}…` }]
        } else {
          out = [{ kind: "err", text: `open: ${arg || "?"}: no such app. Try ls.` }]
        }
        break
      case "whoami":
        out = [{ kind: "out", text: "someone who reads the source" }]
        break
      default:
        out = [{ kind: "err", text: `zsh: command not found: ${head}` }]
    }
    setLines((current) => [...current, echo, ...out])
  }

  return (
    <div
      ref={scroller}
      className={cn("d-term flex-1 overflow-y-auto px-4 pt-3 pb-4", className)}
      onClick={() => {
        if (ready && !window.getSelection()?.toString()) input.current?.focus({ preventScroll: true })
      }}
    >
      <div role="log" aria-label="Terminal output" aria-live="polite">
        {lines.map((line, index) => (
          <TermLine key={index} line={line} />
        ))}
      </div>
      {!ready ? (
        <div aria-hidden="true">
          <Prompt />
          <span>{typed}</span>
          <span className="d-caret" />
        </div>
      ) : (
        <form
          className="flex items-baseline"
          onSubmit={(event) => {
            event.preventDefault()
            run(value)
            setValue("")
          }}
        >
          <Prompt />
          <input
            ref={input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" && history.length) {
                event.preventDefault()
                const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1)
                setCursor(next)
                setValue(history[next] ?? "")
              } else if (event.key === "ArrowDown" && cursor !== -1) {
                event.preventDefault()
                const next = cursor + 1
                if (next >= history.length) {
                  setCursor(-1)
                  setValue("")
                } else {
                  setCursor(next)
                  setValue(history[next] ?? "")
                }
              }
            }}
            aria-label="Terminal command. Try help."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="caret-[#e6e6eb]"
            style={{ caretColor: "#e6e6eb" }}
          />
        </form>
      )}
    </div>
  )
}

function Prompt() {
  return (
    <span className="mr-2 whitespace-nowrap select-none">
      <span className="text-[#64d2ff]">{CWD}</span>
      <span className="text-[#30d158]"> ❯</span>
    </span>
  )
}

function TermLine({ line }: { line: Line }) {
  if (line.kind === "prompt") {
    return (
      <div className="break-all">
        <Prompt />
        <span>{line.text}</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "break-words whitespace-pre-wrap",
        line.kind === "ok" && "text-[#e6e6eb]",
        line.kind === "path" && "text-[#64d2ff]",
        line.kind === "muted" && "text-[rgb(235_235_245/0.5)]",
        line.kind === "err" && "text-[#ff6961]"
      )}
    >
      {line.kind === "ok" ? (
        <>
          <span className="text-[#30d158]">{line.text.slice(0, 1)}</span>
          {line.text.slice(1)}
        </>
      ) : (
        line.text
      )}
    </div>
  )
}
