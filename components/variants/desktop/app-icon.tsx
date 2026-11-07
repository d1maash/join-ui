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
  return (
    <Tile
      from="#3a3a40"
      to="#121214"
      {...props}
      defs={(uid) => (
        <linearGradient id={`${uid}arc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd25e" />
          <stop offset="1" stopColor="#ff8a00" />
        </linearGradient>
      )}
    >
      {({ lift, uid }) => {
        return (
          <>
            <circle cx="50" cy="50" r="26" fill="none" stroke="#fff" strokeOpacity="0.13" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="26"
              fill="none"
              stroke={`url(#${uid}arc)`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${RING * 0.7} ${RING}`}
              transform="rotate(-90 50 50)"
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
        )
      }}
    </Tile>
  )
}

function ToolTraceIcon(props: { className?: string }) {
  const rows = [
    { y: 28, tile: "#30d158", bar: 36, ink: "#c7c7cc", done: true },
    { y: 50, tile: "#30d158", bar: 27, ink: "#c7c7cc", done: true },
    { y: 72, tile: "#0a84ff", bar: 33, ink: "#2c2c2e", done: false },
  ]
  return (
    <Tile from="#ffffff" to="#e2e2e8" paper {...props}>
      {({ lift }) => (
        <>
          <path d="M29 30V70" stroke="#d1d1d6" strokeWidth="3" strokeLinecap="round" />
          {rows.map((row) => (
            <g key={row.y}>
              <rect x="20.5" y={row.y - 8.5} width="17" height="17" rx="5.5" fill={row.tile} filter={lift} />
              {row.done ? (
                <path
                  d={`M24.6 ${row.y}l3.1 3.1 5.8-6.2`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx="29" cy={row.y} r="2.8" fill="#fff" />
              )}
              <rect x="44" y={row.y - 4} width={row.bar} height="8" rx="4" fill={row.ink} />
            </g>
          ))}
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
  return (
    <Tile from="#43de74" to="#15913c" {...props}>
      {({ lift }) => (
        <>
          <path d="M32 28V72" stroke="#fff" strokeOpacity="0.5" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="28" r="8.5" fill="#fff" filter={lift} />
          <path d="M28.2 28.2l2.6 2.6 5-5.4" fill="none" stroke="#1a9a43" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="50" r="13.5" fill="#fff" fillOpacity="0.22" />
          <circle cx="32" cy="50" r="8.5" fill="#fff" filter={lift} />
          <circle cx="32" cy="50" r="3.2" fill="#1a9a43" />
          <circle cx="32" cy="72" r="7" fill="#178f3d" stroke="#fff" strokeOpacity="0.75" strokeWidth="2.6" />
          <rect x="48" y="24.5" width="30" height="7" rx="3.5" fill="#fff" />
          <rect x="48" y="46.5" width="24" height="7" rx="3.5" fill="#fff" />
          <rect x="48" y="68.5" width="19" height="7" rx="3.5" fill="#fff" fillOpacity="0.55" />
        </>
      )}
    </Tile>
  )
}

function FocusStackIcon(props: { className?: string }) {
  const ranks = [
    { y: 18, w: 36, h: 9, r: -16, o: 0.16, dot: "#5e5ce6" },
    { y: 30, w: 46, h: 12, r: -8, o: 0.36, dot: "#ff9f0a" },
    { y: 70, w: 46, h: 12, r: 8, o: 0.36, dot: "#bf5af2" },
    { y: 82, w: 36, h: 9, r: 16, o: 0.16, dot: "#0a84ff" },
  ]
  return (
    <Tile from="#34343a" to="#0e0e10" {...props}>
      {({ deep }) => (
        <>
          {ranks.map((rank) => (
            <g key={rank.y} transform={`rotate(${rank.r} 50 ${rank.y})`} opacity={rank.o * 2.2}>
              <rect
                x={50 - rank.w / 2}
                y={rank.y - rank.h / 2}
                width={rank.w}
                height={rank.h}
                rx={rank.h / 2}
                fill="#fff"
                fillOpacity={rank.o}
              />
              <circle cx={50 - rank.w / 2 + rank.h / 2} cy={rank.y} r={rank.h / 2 - 2} fill={rank.dot} />
            </g>
          ))}
          <g filter={deep}>
            <rect x="20" y="41" width="60" height="18" rx="9" fill="#fff" />
            <circle cx="29" cy="50" r="6" fill="#ff375f" />
            <rect x="39" y="47.8" width="30" height="4.4" rx="2.2" fill="#1c1c1e" />
          </g>
        </>
      )}
    </Tile>
  )
}

function GlassCrestIcon(props: { className?: string }) {
  const discs = [
    { a: -46, c: "#ffd60a" },
    { a: 46, c: "#40c8e0" },
    { a: -23, c: "#ff375f" },
    { a: 23, c: "#0a84ff" },
    { a: 0, c: "#bf5af2" },
  ]
  return (
    <Tile
      from="#22325f"
      to="#0a1022"
      {...props}
      defs={(uid) => (
        <radialGradient id={`${uid}spec`} cx="0.35" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      )}
    >
      {({ deep, uid }) => (
        <>
          {discs.map((disc) => {
            const rad = (disc.a * Math.PI) / 180
            const x = 50 + 46 * Math.sin(rad)
            const y = 96 - 46 * Math.cos(rad)
            return (
              <g key={disc.a} filter={deep}>
                <circle cx={x} cy={y} r="12.5" fill={disc.c} fillOpacity="0.92" />
                <circle cx={x} cy={y} r="12.5" fill={`url(#${uid}spec)`} />
                <circle cx={x - 3.6} cy={y - 4.4} r="4.2" fill="#fff" fillOpacity="0.55" />
                <circle cx={x} cy={y} r="12" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
              </g>
            )
          })}
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
