"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, GalleryHorizontalEnd, LayoutGrid, List, Search, X } from "lucide-react"

import { CopyButton } from "@/components/site/copy-button"
import { renderThumb } from "@/components/previews/thumbs/registry"
import { shadcnAddCommand, siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

import { AppIcon } from "./app-icon"
import { isComponentSlug, tagColour, vh } from "./apps"
import { MaxWindow, PhoneApp } from "./max-window"

export interface CatalogEntry {
  slug: string
  title: string
  description: string
  category: string
  status: string
  since: string
  dependencyCount: number
  tags: string[]
}

type View = "icons" | "list" | "gallery"

const VIEWS: Array<{ id: View; label: string; Icon: typeof LayoutGrid }> = [
  { id: "icons", label: "Icons", Icon: LayoutGrid },
  { id: "list", label: "List", Icon: List },
  { id: "gallery", label: "Gallery", Icon: GalleryHorizontalEnd },
]

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" })
const STATUS: Record<string, string> = {
  stable: "Stable",
  new: "New",
  updated: "Updated",
  experimental: "Experimental",
}

/*
 * The Catalog is a Finder window.
 *
 * Favourites and tags in the sidebar — a tag is a category, and `?category=`
 * is the selected tag, so a filtered catalog is a link like any other. The
 * toolbar switches between the three Finder views: icons (the app icons),
 * a list with real columns, and a gallery whose stage runs the selected
 * component's live thumbnail at size. Search filters as you type.
 */
export function CatalogFromQuery({ items }: { items: CatalogEntry[] }) {
  const params = useSearchParams()
  const category = params.get("category")
  return <Catalog items={items} category={category} />
}

export function Catalog({ items, category }: { items: CatalogEntry[]; category: string | null }) {
  const [view, setView] = React.useState<View>("gallery")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState(items[0]?.slug ?? "")

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    return [...counts.entries()].map(([name, count]) => ({ name, count }))
  }, [items])

  const active = category && categories.some((entry) => entry.name === category) ? category : null

  const shown = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (active && item.category !== active) return false
      if (!needle) return true
      return [item.title, item.description, item.category, ...item.tags].some((field) =>
        field.toLowerCase().includes(needle)
      )
    })
  }, [items, active, query])

  const current = shown.find((item) => item.slug === selected) ?? shown[0]

  const sidebar = (
    <div>
      <p className="d-source-head">Favourites</p>
      <ul>
        <li>
          <Link href={vh("/components")} aria-current={active ? undefined : "page"} className="d-source-row">
            <AppIcon id="catalog" className="size-[18px]" />
            All components
            <span className="ml-auto text-[11.5px] opacity-70">{items.length}</span>
          </Link>
        </li>
        <li>
          <Link href={vh("/")} className="d-source-row">
            <AppIcon id="about" className="size-[18px]" />
            Desktop
          </Link>
        </li>
        <li>
          <Link href={vh("/docs")} className="d-source-row">
            <AppIcon id="docs" className="size-[18px]" />
            Docs
          </Link>
        </li>
      </ul>
      <p className="d-source-head">Tags</p>
      <ul>
        {categories.map((entry) => (
          <li key={entry.name}>
            <Link
              href={`${vh("/components")}?category=${encodeURIComponent(entry.name)}`}
              aria-current={active === entry.name ? "page" : undefined}
              className="d-source-row"
            >
              <span className="grid size-[18px] place-items-center" aria-hidden="true">
                <span className="size-2.5 rounded-full" style={{ background: tagColour(entry.name) }} />
              </span>
              {entry.name}
              <span className="ml-auto text-[11.5px] opacity-70">{entry.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  const empty = shown.length === 0 ? (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <Search aria-hidden="true" className="size-8 text-[var(--d-ink-3)]" />
      <p className="text-[15px] font-medium">Nothing matches “{query}”.</p>
      <button type="button" className="d-btn" onClick={() => setQuery("")}>
        Clear search
      </button>
    </div>
  ) : null

  return (
    <>
      <MaxWindow
        title="Catalog"
        label="Catalog window"
        sidebar={sidebar}
        sidebarLabel="Catalog sidebar"
        mainClassName="flex flex-col"
        heading={
          <>
            <AppIcon id="catalog" className="size-7 shrink-0 drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]" />
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-[14px] font-semibold tracking-[-0.012em]">
                {active ?? "Components"}
              </h1>
              <p className="truncate text-[11.5px] text-[var(--d-ink-3)]">
                {shown.length} of {items.length}
              </p>
            </div>
          </>
        }
        center={
          <div role="group" aria-label="View" className="d-seg">
            {VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                aria-label={`${label} view`}
                title={label}
                className={cn("d-seg-btn d-seg-icon", view === id && "d-seg-on")}
                onClick={() => setView(id)}
              >
                <Icon aria-hidden="true" className="size-[15px]" strokeWidth={2} />
              </button>
            ))}
          </div>
        }
        right={<SearchField value={query} onChange={setQuery} />}
      >
        {empty ?? (
          <>
            {view === "icons" ? <IconView items={shown} /> : null}
            {view === "list" ? <ListView items={shown} /> : null}
            {view === "gallery" && current ? (
              <GalleryView items={shown} current={current} onSelect={setSelected} />
            ) : null}
          </>
        )}
        <div className="d-pathbar">
          <span className="flex min-w-0 items-center gap-1 truncate">
            Join UI <ChevronRight aria-hidden="true" className="size-3" /> Components
            {active ? (
              <>
                <ChevronRight aria-hidden="true" className="size-3" /> {active}
              </>
            ) : null}
          </span>
          <span className="shrink-0">
            {shown.length} {shown.length === 1 ? "item" : "items"}
          </span>
        </div>
      </MaxWindow>

      <PhoneApp title="Catalog">
        <div className="px-4">
          <label className="flex h-9 items-center gap-2 rounded-[10px] bg-white/10 px-3 text-[var(--d-ink-3)]">
            <Search aria-hidden="true" className="size-4" />
            <span className="sr-only">Search components</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[var(--d-ink)] outline-none placeholder:text-[var(--d-ink-3)]"
            />
          </label>
        </div>
        <nav aria-label="Tags" className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1">
          <Link
            href={vh("/components")}
            aria-current={active ? undefined : "page"}
            className="d-chip-link"
          >
            All
          </Link>
          {categories.map((entry) => (
            <Link
              key={entry.name}
              href={`${vh("/components")}?category=${encodeURIComponent(entry.name)}`}
              aria-current={active === entry.name ? "page" : undefined}
              className="d-chip-link"
            >
              <span className="size-2 rounded-full" style={{ background: tagColour(entry.name) }} aria-hidden="true" />
              {entry.name}
            </Link>
          ))}
        </nav>
        {shown.length === 0 ? (
          <p className="px-5 py-10 text-center text-[15px] text-[var(--d-ink-2)]">Nothing matches “{query}”.</p>
        ) : (
          <ul className="mx-4 mt-3 mb-28 overflow-hidden rounded-[14px] bg-white/6">
            {shown.map((item) => (
              <li key={item.slug} className="border-b border-white/8 last:border-b-0">
                <Link href={vh(`/components/${item.slug}`)} className="flex items-center gap-3 px-3 py-2.5">
                  {isComponentSlug(item.slug) ? <AppIcon id={item.slug} className="size-11 shrink-0" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-medium">{item.title}</span>
                    <span className="block truncate text-[13px] text-[var(--d-ink-3)]">{item.description}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[var(--d-ink-3)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PhoneApp>
    </>
  )
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="d-search">
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">Search components</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--d-ink-3)]"
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="grid size-4 place-items-center rounded-full bg-white/25 text-black">
          <X aria-hidden="true" className="size-2.5" strokeWidth={3} />
        </button>
      ) : null}
    </label>
  )
}

function IconView({ items }: { items: CatalogEntry[] }) {
  return (
    <ul className="grid flex-1 content-start gap-x-3 gap-y-6 p-7 [grid-template-columns:repeat(auto-fill,minmax(136px,1fr))]">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={vh(`/components/${item.slug}`)}
            className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center outline-offset-2 hover:bg-white/5"
          >
            {isComponentSlug(item.slug) ? (
              <AppIcon id={item.slug} className="size-[76px] drop-shadow-[0_8px_14px_rgb(0_0_0/0.4)] transition-transform group-hover:-translate-y-0.5" />
            ) : null}
            <span className="rounded-[5px] px-1.5 text-[13px] leading-tight font-medium group-hover:bg-[var(--d-blue)] group-focus-visible:bg-[var(--d-blue)]">
              {item.title}
            </span>
            <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--d-ink-3)]">
              <span className="size-1.5 rounded-full" style={{ background: tagColour(item.category) }} aria-hidden="true" />
              {item.category}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function ListView({ items }: { items: CatalogEntry[] }) {
  return (
    <div className="flex-1 p-5">
      <div className="d-list overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
          <caption className="sr-only">Components</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Tag</th>
              <th scope="col">Status</th>
              <th scope="col">Added</th>
              <th scope="col">npm deps</th>
              <th scope="col">What it is</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.slug}>
                <th scope="row" className="font-medium whitespace-nowrap">
                  <Link href={vh(`/components/${item.slug}`)} className="inline-flex items-center gap-2.5 rounded hover:underline">
                    {isComponentSlug(item.slug) ? <AppIcon id={item.slug} className="size-6" /> : null}
                    {item.title}
                  </Link>
                </th>
                <td className="whitespace-nowrap text-[var(--d-ink-2)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: tagColour(item.category) }} aria-hidden="true" />
                    {item.category}
                  </span>
                </td>
                <td className="text-[var(--d-ink-2)]">{STATUS[item.status] ?? item.status}</td>
                <td className="whitespace-nowrap text-[var(--d-ink-2)] tabular-nums">{DATE.format(new Date(item.since))}</td>
                <td className="text-[var(--d-ink-2)] tabular-nums">{item.dependencyCount || "—"}</td>
                <td className="text-[var(--d-ink-2)]">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GalleryView({
  items,
  current,
  onSelect,
}: {
  items: CatalogEntry[]
  current: CatalogEntry
  onSelect: (slug: string) => void
}) {
  const strip = React.useRef<Array<HTMLButtonElement | null>>([])
  const index = items.findIndex((item) => item.slug === current.slug)
  const command = shadcnAddCommand(`${siteConfig.namespace}/${current.slug}`, "pnpm")

  const move = (event: React.KeyboardEvent) => {
    let next = -1
    if (event.key === "ArrowRight") next = Math.min(items.length - 1, index + 1)
    else if (event.key === "ArrowLeft") next = Math.max(0, index - 1)
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = items.length - 1
    if (next === -1) return
    event.preventDefault()
    const item = items[next]
    if (!item) return
    onSelect(item.slug)
    strip.current[next]?.focus()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid flex-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="d-gallery-stage dark" inert aria-hidden="true">
          <div key={current.slug} className="d-gallery-thumb">
            {renderThumb(current.slug)}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {isComponentSlug(current.slug) ? <AppIcon id={current.slug} className="size-12 shrink-0" /> : null}
            <div className="min-w-0">
              <h2 className="text-[22px] font-semibold tracking-[-0.022em]">{current.title}</h2>
              <p className="flex items-center gap-1.5 text-[12.5px] text-[var(--d-ink-3)]">
                <span className="size-2 rounded-full" style={{ background: tagColour(current.category) }} aria-hidden="true" />
                {current.category} · {STATUS[current.status] ?? current.status}
              </p>
            </div>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-[var(--d-ink-2)]">{current.description}</p>
          <dl className="d-info">
            <dt>Added</dt>
            <dd>{DATE.format(new Date(current.since))}</dd>
            <dt>npm</dt>
            <dd>{current.dependencyCount ? `${current.dependencyCount} package${current.dependencyCount === 1 ? "" : "s"}` : "None"}</dd>
          </dl>
          <div className="flex items-center gap-1 rounded-[10px] bg-black/35 py-1 pr-1 pl-3 shadow-[inset_0_0_0_0.5px_rgb(255_255_255/0.1)]">
            <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-[var(--d-ink-2)]">{command}</code>
            <CopyButton value={command} label="Copy install command" toastMessage="Install command copied" />
          </div>
          <Link href={vh(`/components/${current.slug}`)} className="d-btn h-9 text-[14px]" data-tone="blue">
            Open {current.title}
          </Link>
        </div>
      </div>
      <div role="listbox" aria-label="Components" aria-orientation="horizontal" className="d-filmstrip" onKeyDown={move}>
        {items.map((item, i) => {
          const on = item.slug === current.slug
          return (
            <button
              key={item.slug}
              ref={(node) => {
                strip.current[i] = node
              }}
              type="button"
              role="option"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(item.slug)}
              className={cn("d-film", on && "d-film-on")}
            >
              {isComponentSlug(item.slug) ? <AppIcon id={item.slug} className="size-11" /> : null}
              <span className="max-w-full truncate text-[11.5px]">{item.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
