import type * as React from "react"
import Link from "next/link"
import {
  AppWindow,
  FileText,
  Hexagon,
  Layers,
  ListTree,
  Milestone,
  Rainbow,
  ShieldQuestion,
  Type,
} from "lucide-react"

import { docsNav } from "@/lib/docs/nav"
import { componentsByName } from "@/lib/registry"
import { variantHref } from "@/lib/variants"

const href = (path: string) => variantHref("run", path)

export const COMPONENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "agent-hive": Hexagon,
  "approval-gate": ShieldQuestion,
  "carbon-copy": Type,
  "focus-stack": Layers,
  "glass-crest": Rainbow,
  "status-timeline": Milestone,
  "tool-trace": ListTree,
}

function Group({
  title,
  items,
  current,
}: {
  title: string
  items: Array<{ key: string; title: string; to: string; icon: React.ComponentType<{ className?: string }> }>
  current: string
}) {
  return (
    <div>
      <p className="run-label px-2 pb-2">{title}</p>
      <ul className="flex flex-col gap-px">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.key}>
              <Link
                href={href(item.to)}
                className="run-source-item"
                aria-current={item.to === current ? "page" : undefined}
              >
                <Icon className="size-[15px] shrink-0 opacity-70" />
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/*
 * The Finder-style source list down the left of the reading pages: the seven
 * components and every guide, the current one selected. On the component page
 * the components lead; in the docs the guides do.
 */
export function SourceList({
  current,
  lead = "components",
}: {
  /** The site path of the page being read, e.g. `/components/tool-trace`. */
  current: string
  lead?: "components" | "docs"
}) {
  const components = (
    <Group
      key="components"
      title="Components"
      current={current}
      items={componentsByName.map((item) => ({
        key: item.slug,
        title: item.title,
        to: `/components/${item.slug}`,
        icon: COMPONENT_ICONS[item.slug] ?? AppWindow,
      }))}
    />
  )
  const docs = docsNav.map((section) => (
    <Group
      key={section.title}
      title={section.title}
      current={current}
      items={section.items.map((page) => ({
        key: page.slug,
        title: page.title,
        to: page.href,
        icon: FileText,
      }))}
    />
  ))

  return (
    <aside className="hidden lg:block" aria-label="Components and guides">
      <nav className="sticky top-14 flex max-h-[calc(100dvh-3.5rem)] flex-col gap-7 overflow-y-auto pt-20 pb-10 [scrollbar-width:none]">
        {lead === "components" ? [components, ...docs] : [...docs, components]}
      </nav>
    </aside>
  )
}
