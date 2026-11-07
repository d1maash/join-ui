import type * as React from "react"

import { cn } from "@/lib/utils"

import { Prose } from "./sibling"
import type { KeyboardInteraction, PropGroup } from "@/types/registry"

/** A key cap, the way macOS draws one in a menu: light, raised, small. */
export function GlassKbd({ className, ...props }: React.ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-[7px] bg-white px-1.5 font-sans text-[12px] leading-none font-medium text-[#1d1d1f]",
        "shadow-[0_0_0_0.5px_rgb(24_32_72/0.14),0_1px_0_rgb(24_32_72/0.14),0_1px_3px_rgb(24_32_72/0.06)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * The props reference as a list of rows on glass rather than a four-column
 * table: the name and its type on one line, the default beside them, the
 * description under. It reads on a phone without a horizontal scroll, and a
 * long union type has the whole width to wrap in.
 */
export function GlassProps({ groups }: { groups: PropGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-[17px] text-[#56565b]">This component takes no props.</p>
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <div key={group.name}>
          <div className="mb-4 px-1">
            <h3 className="font-mono text-[17px] font-medium tracking-[-0.02em] text-[#1d1d1f]">
              {group.name}
            </h3>
            {group.description ? (
              <p className="mt-1 text-[15px] leading-[1.45] text-[#56565b]">
                <Prose text={group.description} />
              </p>
            ) : null}
          </div>
          <dl className="g-glass g-flat divide-y divide-black/[0.06] overflow-hidden rounded-[28px] [--g-fill:0.74]">
            {group.props.map((prop) => (
              <div
                key={prop.name}
                className="grid gap-x-8 gap-y-1.5 px-5 py-4 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:px-6"
              >
                <dt className="font-mono text-[14px] font-medium text-[#1d1d1f]">
                  {prop.name}
                  {prop.required ? (
                    <>
                      <span aria-hidden="true" className="text-[#d70015]">
                        *
                      </span>
                      <span className="sr-only"> (required)</span>
                    </>
                  ) : null}
                </dt>
                <dd className="min-w-0">
                  <p className="font-mono text-[13px] leading-[1.6] break-words text-[#0058b8]">
                    {prop.type}
                    {prop.defaultValue ? (
                      <span className="text-[#56565b]"> = {prop.defaultValue}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[15px] leading-[1.47] tracking-[-0.012em] text-[#3a3a3e]">
                    <Prose text={prop.description} />
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

export function GlassKeyboard({
  entries,
  title,
}: {
  entries: KeyboardInteraction[]
  title: string
}) {
  if (entries.length === 0) {
    return (
      <p className="text-[17px] leading-[1.47] text-[#3a3a3e]">
        {title} renders no controls of its own, so it adds nothing to the tab order.
      </p>
    )
  }

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Keyboard interactions for {title}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Behaviour</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr
            key={entry.keys.join("-")}
            className="border-b border-black/[0.06] align-top last:border-b-0"
          >
            <th scope="row" className="py-3.5 pr-5 whitespace-nowrap">
              <span className="flex flex-wrap gap-1">
                {entry.keys.map((key) => (
                  <GlassKbd key={key}>{key}</GlassKbd>
                ))}
              </span>
            </th>
            <td className="py-3.5 text-[15px] leading-[1.47] tracking-[-0.012em] text-[#3a3a3e]">
              <Prose text={entry.description} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
