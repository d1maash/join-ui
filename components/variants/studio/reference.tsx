import { Check } from "lucide-react"

import type { KeyboardInteraction, PropGroup } from "@/types/registry"

import { SubHeading } from "./doc-parts"

/**
 * API reference. Name and description share the first column, so a long
 * description wraps under its prop instead of squeezing the type column.
 */
export function PropsReference({ groups, idPrefix }: { groups: PropGroup[]; idPrefix: string }) {
  if (groups.length === 0) {
    return <p className="text-[15px] text-muted-foreground">This component takes no props.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-3">
          {groups.length > 1 ? (
            <div className="flex flex-col gap-1">
              <SubHeading id={`${idPrefix}-${group.name.toLowerCase()}`}>
                <code className="text-[14px]">{group.name}</code>
              </SubHeading>
              {group.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{group.description}</p>
              ) : null}
            </div>
          ) : null}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Props for {group.name}</caption>
              <thead>
                <tr className="border-b border-border bg-subtle text-xs text-muted-foreground">
                  <th scope="col" className="w-[52%] px-4 py-2.5 font-medium">
                    Prop
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.props.map((prop) => (
                  <tr key={prop.name} className="border-b border-border align-top last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <code className="rounded-md bg-muted px-1.5 py-0.5 text-[12.5px] font-medium text-foreground">
                          {prop.name}
                        </code>
                        {prop.required ? (
                          <span className="text-[11px] font-medium text-critical">
                            required
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
                        {prop.description}
                      </span>
                    </th>
                    <td className="px-4 py-3">
                      <code className="text-[12.5px] leading-relaxed break-words text-foreground">{prop.type}</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[12.5px] whitespace-nowrap text-muted-foreground">
                        {prop.defaultValue ?? "—"}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AccessibilityList({ notes }: { notes: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note} className="flex gap-3 text-[15px] leading-relaxed text-[var(--st-prose)]">
          <span className="mt-1 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-muted">
            <Check aria-hidden="true" className="size-3 text-foreground" />
          </span>
          <span>{note}</span>
        </li>
      ))}
    </ul>
  )
}

export function KeyboardTable({ entries, title }: { entries: KeyboardInteraction[]; title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Keyboard interactions for {title}</caption>
        <thead>
          <tr className="border-b border-border bg-subtle text-xs text-muted-foreground">
            <th scope="col" className="w-48 px-4 py-2.5 font-medium">
              Key
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.keys.join("+")} className="border-b border-border align-top last:border-b-0">
              <th scope="row" className="px-4 py-3 text-left font-normal">
                <span className="flex flex-wrap gap-1">
                  {entry.keys.map((key) => (
                    <kbd
                      key={key}
                      className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-background px-1.5 text-xs font-medium text-foreground shadow-[0_1px_0_var(--border)]"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </th>
              <td className="px-4 py-3 leading-relaxed text-muted-foreground">{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
