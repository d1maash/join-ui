"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { siteConfig } from "@/lib/site"

import { AppIcon } from "./app-icon"
import { COMPONENT_SLUGS, SYSTEM_NAME, isComponentSlug, vh, type AppId } from "./apps"
import { useStill } from "./hooks"
import { useOs } from "./os"

const BASE = 52
const PEAK = 80
const REACH = 160

type DockEntry = { id: AppId } | { sep: true; key: string }

const ENTRIES: DockEntry[] = [
  { id: "catalog" },
  { id: "docs" },
  { id: "terminal" },
  { sep: true, key: "a" },
  ...COMPONENT_SLUGS.map((id) => ({ id })),
  { sep: true, key: "b" },
  { id: "github" },
]

/*
 * The Dock.
 *
 * On the desktop every icon launches a window, and the window grows out of
 * the icon. Anywhere else the Dock hides itself, like a Dock set to hide on a
 * small screen, and its icons become plain links: a component's icon goes to
 * its page, the Terminal goes back to the desktop and opens there.
 *
 * Magnification is the classic one — each icon's size is a function of its
 * distance from the pointer, sprung — and it is switched off entirely under
 * reduced motion, where the icons simply sit at their resting size.
 */
export function Dock() {
  const os = useOs()
  const pathname = usePathname()
  const router = useRouter()
  const still = useStill()
  const mouseX = useMotionValue(Infinity)
  const [revealed, setRevealed] = React.useState(false)
  const hideTimer = React.useRef(0)

  const onDesktop = os.desktopMounted
  const hidden = !onDesktop && !revealed

  const pageSlug = /\/components\/([^/?#]+)/.exec(pathname)?.[1]

  const reveal = () => {
    window.clearTimeout(hideTimer.current)
    setRevealed(true)
  }
  const conceal = () => {
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setRevealed(false), 500)
  }

  React.useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const launch = (id: AppId) => {
    if (onDesktop) {
      if (os.handleDock(id)) return
      os.open(id, "dock")
    } else {
      os.setPending(id)
      router.push(vh("/"))
    }
  }

  return (
    <>
      {!onDesktop ? <div className="d-dock-wake" onPointerEnter={reveal} aria-hidden="true" /> : null}
      <div
        className="d-dock-wrap"
        data-hidden={hidden}
        onPointerEnter={reveal}
        onPointerLeave={conceal}
        onFocus={reveal}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) conceal()
        }}
      >
        <nav aria-label="Dock">
          <motion.ul
            className="d-dock"
            onPointerMove={(event) => {
              if (event.pointerType === "mouse") mouseX.set(event.clientX)
            }}
            onPointerLeave={() => mouseX.set(Infinity)}
          >
            {ENTRIES.map((entry) =>
              "sep" in entry ? (
                <li key={entry.key} className="d-dock-sep" aria-hidden="true" />
              ) : (
                <DockIcon
                  key={entry.id}
                  id={entry.id}
                  mouseX={mouseX}
                  still={still}
                  running={
                    os.wins[entry.id]?.status === "open" ||
                    os.wins[entry.id]?.status === "minimized" ||
                    entry.id === pageSlug
                  }
                  badge={os.badges[entry.id]}
                  launches={os.launches[entry.id] ?? 0}
                  onDesktop={onDesktop}
                  onLaunch={launch}
                />
              )
            )}
          </motion.ul>
        </nav>
      </div>
    </>
  )
}

function DockIcon({
  id,
  mouseX,
  still,
  running,
  badge,
  launches,
  onDesktop,
  onLaunch,
}: {
  id: AppId
  mouseX: MotionValue<number>
  still: boolean
  running: boolean
  badge?: number
  launches: number
  onDesktop: boolean
  onLaunch: (id: AppId) => void
}) {
  const os = useOs()
  const ref = React.useRef<HTMLLIElement>(null)
  const [tip, setTip] = React.useState(false)
  const lift = useMotionValue(0)

  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box || !Number.isFinite(x)) return REACH
    return x - (box.left + box.width / 2)
  })
  const target = useTransform(distance, [-REACH, 0, REACH], [BASE, PEAK, BASE], { clamp: true })
  const size = useSpring(target, { stiffness: 420, damping: 32, mass: 0.6 })

  const { registerDockIcon } = os
  React.useEffect(() => {
    registerDockIcon(id, ref.current)
    return () => registerDockIcon(id, null)
  }, [id, registerDockIcon])

  /* The launch bounce: two hops, the second smaller, as an app starts up. */
  const seen = React.useRef(launches)
  React.useEffect(() => {
    if (launches === seen.current) return
    seen.current = launches
    if (still) return
    void animate(lift, [0, -18, 0, -7, 0], { duration: 0.75, ease: "easeOut" })
  }, [launches, still, lift])

  const name = isComponentSlug(id) ? (os.component(id)?.title ?? id) : SYSTEM_NAME[id]
  const label = badge ? `${name}, ${badge} waiting` : name

  const body = (
    <>
      <AppIcon id={id} />
      {badge ? (
        <span className="d-dock-badge" aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </>
  )

  const common = {
    className: "d-dock-btn block size-full",
    "aria-label": label,
    onPointerEnter: () => setTip(true),
    onPointerLeave: () => setTip(false),
    onFocus: () => setTip(true),
    onBlur: () => setTip(false),
  }

  let control: React.ReactNode
  if (id === "github") {
    control = (
      <a {...common} href={siteConfig.links.repo} target="_blank" rel="noreferrer noopener" aria-label={`${name} (opens in a new tab)`}>
        {body}
      </a>
    )
  } else if (id === "docs") {
    control = (
      <Link {...common} href={vh("/docs")}>
        {body}
      </Link>
    )
  } else if (!onDesktop && isComponentSlug(id)) {
    control = (
      <Link {...common} href={vh(`/components/${id}`)}>
        {body}
      </Link>
    )
  } else if (!onDesktop && id === "catalog") {
    control = (
      <Link {...common} href={vh("/components")}>
        {body}
      </Link>
    )
  } else {
    control = (
      <button {...common} type="button" onClick={() => onLaunch(id)}>
        {body}
      </button>
    )
  }

  return (
    <motion.li
      ref={ref}
      className="relative"
      style={{
        width: still ? BASE : size,
        height: still ? BASE : size,
        y: lift,
      }}
    >
      {control}
      {tip ? (
        <span className="d-tip" aria-hidden="true">
          {name}
        </span>
      ) : null}
      {running ? <span className="d-dock-dot" aria-hidden="true" /> : null}
    </motion.li>
  )
}
