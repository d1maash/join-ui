import * as React from "react"

import { cn } from "@/lib/utils"
import type { PropGroup } from "@/types/registry"

export interface PropsTableProps {
  groups: PropGroup[]
  className?: string
}

/**
 * Props reference.
 *
 * A real `<table>` with scoped headers on desktop so screen readers can
 * associate each cell with its column, and a stacked definition layout below
 * `md` where a four-column table would otherwise force horizontal scrolling.
 */
export function PropsTable({ groups, className }: PropsTableProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {groups.map((group) => (
        <section key={group.name} className="flex flex-col gap-3">
          {groups.length > 1 || group.description ? (
            <div className="flex flex-col gap-1">
              <h3 className="font-mono text-sm font-semibold tracking-tight">
                {group.name}
              </h3>
              {group.description ? (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              ) : null}
            </div>
          ) : null}

          {/* Desktop: tabular. */}
          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Props for {group.name}</caption>
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Prop
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Default
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.props.map((prop) => (
                  <tr
                    key={prop.name}
                    className="border-b border-border align-top last:border-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-normal whitespace-nowrap"
                    >
                      <code className="font-mono text-[0.8125rem] font-medium text-foreground">
                        {prop.name}
                      </code>
                      {prop.required ? (
                        <span className="ml-1.5 align-middle text-[0.625rem] font-medium tracking-wide text-destructive uppercase">
                          required
                        </span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3">
                      <code className="font-mono text-[0.8125rem] text-primary">
                        {prop.type}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {prop.defaultValue ? (
                        <code className="font-mono text-[0.8125rem] text-muted-foreground">
                          {prop.defaultValue}
                        </code>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prop.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked, so nothing scrolls sideways. */}
          <dl className="flex flex-col gap-3 md:hidden">
            {group.props.map((prop) => (
              <div
                key={prop.name}
                className="rounded-xl border border-border bg-card p-4"
              >
                <dt className="flex flex-wrap items-center gap-1.5">
                  <code className="font-mono text-[0.8125rem] font-medium">
                    {prop.name}
                  </code>
                  {prop.required ? (
                    <span className="text-[0.625rem] font-medium tracking-wide text-destructive uppercase">
                      required
                    </span>
                  ) : null}
                </dt>
                <dd className="mt-1.5 flex flex-col gap-1.5">
                  <code className="font-mono text-[0.8125rem] text-primary">
                    {prop.type}
                  </code>
                  {prop.defaultValue ? (
                    <p className="text-xs text-muted-foreground">
                      Default: <code className="font-mono">{prop.defaultValue}</code>
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
