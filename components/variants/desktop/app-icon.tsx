import * as React from "react"

import { MARK } from "@/lib/brand"
import { cn } from "@/lib/utils"

import type { AppId } from "./apps"

/*
 * App icons.
 *
 * Drawn, not downloaded: each one is a squircle tile with its own material —
 * graphite, paper, enamel, glass — a glyph that is a small scene of what the
 * component actually does, and the three layers every icon since Big Sur is
 * built from: the tile, the glyph lifted off it by a short shadow, and the
 * light on top (a sheen under the top edge and a rim that is brighter where
 * the light hits it).
 *
 * The squircle is a continuous-corner rounded square: each corner is one
 * cubic that starts 35% in from the corner, which is what keeps the curve
 * from snapping onto the straight edge the way a circular radius does.
 */
const SQ =
  "M35 0H65C91 0 100 9 100 35V65C100 91 91 100 65 100H35C9 100 0 91 0 65V35C0 9 9 0 35 0Z"

interface TileProps {
  from: string
  to: string
  /** Paper tiles want a darker rim and a softer sheen than enamel ones. */
  paper?: boolean
  children: (ids: { lift: string; deep: string; uid: string }) => React.ReactNode
  defs?: (uid: string) => React.ReactNode
  className?: string
  title?: string
}

function Tile({ from, to, paper = false, children, defs, className, title }: TileProps) {
  const uid = React.useId().replace(/:/g, "")
  const bg = `${uid}bg`
  const rim = `${uid}rim`
  const sheen = `${uid}sh`
  const clip = `${uid}cl`
  const lift = `${uid}lf`
  const deep = `${uid}dp`

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("block shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={paper ? 0.9 : 0.5} />
          <stop offset="0.3" stopColor="#fff" stopOpacity={paper ? 0.2 : 0.07} />
          <stop offset="1" stopColor={paper ? "#000" : "#fff"} stopOpacity={paper ? 0.12 : 0.14} />
        </linearGradient>
        <radialGradient id={sheen} cx="0.5" cy="-0.15" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity={paper ? 0.35 : 0.2} />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <path d={SQ} />
        </clipPath>
        <filter id={lift} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.5" floodColor="#000" floodOpacity="0.32" />
        </filter>
        <filter id={deep} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
        </filter>
        {defs?.(uid)}
      </defs>
      <path d={SQ} fill={`url(#${bg})`} />
      <g clipPath={`url(#${clip})`}>{children({ lift: `url(#${lift})`, deep: `url(#${deep})`, uid })}</g>
      <path d={SQ} fill={`url(#${sheen})`} />
      <path
        d={SQ}
        fill="none"
        stroke={`url(#${rim})`}
        strokeWidth="2"
        clipPath={`url(#${clip})`}
      />
    </svg>
  )
}

const RING = 2 * Math.PI * 26

function ApprovalGateIcon(props: { className?: string }) {
  /* Amber, one idea: the clock that drains while it waits, and the tick it ends on. */
  return (
    <Tile from="#ffd35a" to="#ff8f00" {...props}>
      {({ lift }) => (
        <>
          <circle cx="50" cy="50" r="26" fill="none" stroke="#8a3d00" strokeOpacity="0.22" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="26"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${RING * 0.7} ${RING}`}
            transform="rotate(-90 50 50)"
            filter={lift}
          />
          <path
            d="M38.5 50.5l8 8 15-16.5"
            fill="none"
            stroke="#fff"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={lift}
          />
        </>
      )}
    </Tile>
  )
}

function ToolTraceIcon(props: { className?: string }) {
  /* Teal, a staircase: each tool call steps down from the last, the newest still running. */
  const steps = [
    { x: 17, y: 17, done: true },
    { x: 41, y: 41, done: true },
    { x: 65, y: 65, done: false },
  ]
  return (
    <Tile from="#5ce6d6" to="#078a92" {...props}>
      {({ lift }) => (
        <>
          <path
            d="M26 35V50H41M50 59V74H65"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {steps.map((step) =>
            step.done ? (
              <g key={step.x} filter={lift}>
                <rect x={step.x} y={step.y} width="18" height="18" rx="6" fill="#fff" />
                <path
                  d={`M${step.x + 4.6} ${step.y + 9.2}l3.2 3.2 5.8-6.4`}
                  fill="none"
                  stroke="#078a92"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              <g key={step.x} filter={lift}>
                <rect x={step.x + 1.5} y={step.y + 1.5} width="15" height="15" rx="5" fill="none" stroke="#fff" strokeWidth="3" />
                <circle cx={step.x + 9} cy={step.y + 9} r="3" fill="#fff" />
              </g>
            )
          )}
        </>
      )}
    </Tile>
  )
}

function hexPath(cx: number, cy: number, r: number) {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 90) * Math.PI) / 180
    return `${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`
  })
  return `M${points.join("L")}Z`
}

function AgentHiveIcon(props: { className?: string }) {
  const d = 19.6
  const cells = [
    [50, 50],
    [50 + d, 50],
    [50 + d / 2, 50 + d * 0.866],
    [50 - d / 2, 50 + d * 0.866],
    [50 - d, 50],
    [50 - d / 2, 50 - d * 0.866],
  ] as const
  const picked = [50 + d / 2, 50 - d * 0.866] as const
  return (
    <Tile
      from="#5b4ff0"
      to="#1c1566"
      {...props}
      defs={(uid) => (
        <linearGradient id={`${uid}cell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fe0ff" />
          <stop offset="1" stopColor="#1f8fff" />
        </linearGradient>
      )}
    >
      {({ deep }) => (
        <>
          <circle cx={picked[0]} cy={picked[1]} r="24" fill="#5ac8fa" opacity="0.28" />
          {cells.map(([x, y], index) => (
            <path
              key={`${x}-${y}`}
              d={hexPath(x, y, 10.4)}
              fill="#fff"
              fillOpacity={index === 0 ? 0.3 : 0.16}
              stroke="#fff"
              strokeOpacity="0.42"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          ))}
          <path
            d={hexPath(picked[0], picked[1], 11.2)}
            fill="#64d2ff"
            stroke="#fff"
            strokeOpacity="0.85"
            strokeWidth="1"
            strokeLinejoin="round"
            filter={deep}
          />
          <path
            d={`M${picked[0] - 3.6} ${picked[1] - 4.4}l4.4 4.4-4.4 4.4M${picked[0] + 0.6} ${picked[1] - 4.4}l4.4 4.4-4.4 4.4`}
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Tile>
  )
}

function StatusTimelineIcon(props: { className?: string }) {
  /* Green, a horizontal track: two stops behind you, the next one lit. */
  return (
    <Tile from="#4fe07d" to="#138a39" {...props}>
      {({ lift }) => (
        <>
          <path d="M24 50H76" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 50H50" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <circle cx="24" cy="50" r="8.5" fill="#fff" filter={lift} />
          <path d="M20.2 50.2l2.6 2.6 5-5.4" fill="none" stroke="#15913c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="16" fill="#fff" fillOpacity="0.24" />
          <circle cx="50" cy="50" r="10.5" fill="#fff" filter={lift} />
          <circle cx="50" cy="50" r="4" fill="#15913c" />
          <circle cx="76" cy="50" r="7" fill="#17913d" stroke="#fff" strokeOpacity="0.8" strokeWidth="3" />
        </>
      )}
    </Tile>
  )
}

function FocusStackIcon(props: { className?: string }) {
  /* Coral, a coil of pills twisting away from the one in focus. */
  const ranks = [
    { y: 19, w: 34, h: 9, r: -16, o: 0.26 },
    { y: 31, w: 46, h: 12, r: -8, o: 0.48 },
    { y: 69, w: 46, h: 12, r: 8, o: 0.48 },
    { y: 81, w: 34, h: 9, r: 16, o: 0.26 },
  ]
  return (
    <Tile from="#ff8a7a" to="#e02656" {...props}>
      {({ deep }) => (
        <>
          {ranks.map((rank) => (
            <rect
              key={rank.y}
              x={50 - rank.w / 2}
              y={rank.y - rank.h / 2}
              width={rank.w}
              height={rank.h}
              rx={rank.h / 2}
              fill="#fff"
              fillOpacity={rank.o}
              transform={`rotate(${rank.r} 50 ${rank.y})`}
            />
          ))}
          <g filter={deep}>
            <rect x="19" y="41" width="62" height="18" rx="9" fill="#fff" />
            <circle cx="28.5" cy="50" r="5.5" fill="#e8345f" />
            <rect x="38" y="47.8" width="32" height="4.4" rx="2.2" fill="#2c2c2e" />
          </g>
        </>
      )}
    </Tile>
  )
}

function GlassCrestIcon(props: { className?: string }) {
  /* Violet, one bow of frosted glass: three discs on an arc, the middle one lit. */
  const discs = [
    { x: 29, y: 58, r: 14, lit: false },
    { x: 71, y: 58, r: 14, lit: false },
    { x: 50, y: 45, r: 18, lit: true },
  ]
  return (
    <Tile
      from="#c77dff"
      to="#5b1bc4"
      {...props}
      defs={(uid) => (
        <linearGradient id={`${uid}disc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#ead9ff" />
        </linearGradient>
      )}
    >
      {({ deep, uid }) => (
        <>
          {discs.map((disc) => (
            <g key={disc.x} filter={disc.lit ? deep : undefined}>
              <circle
                cx={disc.x}
                cy={disc.y}
                r={disc.r}
                fill={disc.lit ? `url(#${uid}disc)` : "#fff"}
                fillOpacity={disc.lit ? 1 : 0.3}
              />
              <circle cx={disc.x} cy={disc.y} r={disc.r - 0.6} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.2" />
            </g>
          ))}
          <ellipse cx="44" cy="37" rx="7" ry="4" fill="#fff" transform="rotate(-28 44 37)" />
        </>
      )}
    </Tile>
  )
}

function CarbonCopyIcon(props: { className?: string }) {
  const face = "-apple-system, 'SF Pro Display', var(--font-inter), system-ui, sans-serif"
  return (
    <Tile from="#fffdf6" to="#e9e2d0" paper {...props}>
      {() => (
        <>
          <path d="M14 80H86" stroke="#2f5bd3" strokeOpacity="0.16" strokeWidth="1.2" />
          <text
            x="54"
            y="68"
            textAnchor="middle"
            fontFamily={face}
            fontSize="46"
            fontWeight="700"
            letterSpacing="-1.5"
            fill="#2f5bd3"
            fillOpacity="0.85"
          >
            Aa
          </text>
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontFamily={face}
            fontSize="46"
            fontWeight="700"
            letterSpacing="-1.5"
            fill="#1c1c1e"
          >
            Aa
          </text>
        </>
      )}
    </Tile>
  )
}

function CatalogIcon(props: { className?: string }) {
  return (
    <Tile from="#55b0ff" to="#0a5ce0" {...props}>
      {({ lift, deep }) => (
        <>
          <rect x="22" y="22" width="24" height="24" rx="7" fill="#fff" filter={lift} />
          <rect x="22" y="54" width="24" height="24" rx="7" fill="#fff" fillOpacity="0.6" filter={lift} />
          <rect x="54" y="54" width="24" height="24" rx="7" fill="#fff" filter={lift} />
          <rect x="54" y="22" width="24" height="24" rx="7" fill="#fff" fillOpacity="0.32" />
          <rect
            x="56"
            y="18"
            width="24"
            height="24"
            rx="7"
            fill="#fff"
            transform="rotate(9 68 30)"
            filter={deep}
          />
        </>
      )}
    </Tile>
  )
}

function DocsIcon(props: { className?: string }) {
  return (
    <Tile from="#ffb340" to="#f26b00" {...props}>
      {({ deep }) => (
        <>
          <g filter={deep}>
            <path d="M50 33C42 27.5 31 26.5 21 28.5V71C31 69 42 70 50 75.5Z" fill="#fff" />
            <path d="M50 33C58 27.5 69 26.5 79 28.5V71C69 69 58 70 50 75.5Z" fill="#fff5ea" />
          </g>
          <path d="M50 33V75.5" stroke="#f26b00" strokeOpacity="0.35" strokeWidth="1" />
          {[40, 48, 56].map((y) => (
            <path key={y} d={`M27 ${y - 1}C33 ${y - 2.4} 39 ${y - 2} 44 ${y}`} fill="none" stroke="#f26b00" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
          ))}
          {[48, 56].map((y) => (
            <path key={y} d={`M56 ${y}C61 ${y - 2} 67 ${y - 2.4} 73 ${y - 1}`} fill="none" stroke="#f26b00" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
          ))}
          <path d="M64 27.4V43l3.6-3 3.6 3V27.2C68.8 27 66.4 27.1 64 27.4Z" fill="#ff3b30" />
        </>
      )}
    </Tile>
  )
}

function TerminalIcon(props: { className?: string }) {
  return (
    <Tile from="#57575d" to="#232326" {...props}>
      {({ lift }) => (
        <>
          <rect x="12" y="16" width="76" height="68" rx="10" fill="#0b0b0d" filter={lift} />
          <rect x="12.5" y="16.5" width="75" height="67" rx="9.5" fill="none" stroke="#fff" strokeOpacity="0.1" />
          <path d="M24 34l10 7.5L24 49" fill="none" stroke="#f2f2f7" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y="46.5" width="15" height="4.4" rx="1.4" fill="#f2f2f7" />
        </>
      )}
    </Tile>
  )
}

function GitHubAppIcon(props: { className?: string }) {
  return (
    <Tile from="#30363d" to="#0d1117" {...props}>
      {({ lift }) => (
        <g transform="translate(26 26) scale(3)" filter={lift}>
          <path
            fill="#fff"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </g>
      )}
    </Tile>
  )
}

function JoinIcon(props: { className?: string }) {
  return (
    <Tile from="#2a2a30" to="#050506" {...props}>
      {({ lift }) => (
        <g transform="translate(21 21) scale(2.42)" filter={lift}>
          {MARK.paths.map((d) => (
            <path key={d} d={d} fill="#f5f5f7" />
          ))}
        </g>
      )}
    </Tile>
  )
}

const ICONS: Record<AppId, (props: { className?: string }) => React.ReactNode> = {
  "approval-gate": ApprovalGateIcon,
  "tool-trace": ToolTraceIcon,
  "agent-hive": AgentHiveIcon,
  "status-timeline": StatusTimelineIcon,
  "focus-stack": FocusStackIcon,
  "glass-crest": GlassCrestIcon,
  "carbon-copy": CarbonCopyIcon,
  catalog: CatalogIcon,
  docs: DocsIcon,
  terminal: TerminalIcon,
  github: GitHubAppIcon,
  about: JoinIcon,
}

export function AppIcon({ id, className }: { id: AppId; className?: string }) {
  const Icon = ICONS[id]
  return <Icon className={className} />
}
