import type { PropGroup } from "@/types/registry"

/**
 * Props reference.
 *
 * Required props are marked with an asterisk and a visually hidden word, so
 * the marker never depends on its tint to be understood.
 */
export function PropsTable({ groups }: { groups: PropGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-muted-foreground">This component takes no props.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-mono text-sm font-semibold">{group.name}</h3>
            {group.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Props for {group.name}</caption>
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th scope="col" className="label-micro px-4 py-2.5 text-muted-foreground">
                    Prop
                  </th>
                  <th scope="col" className="label-micro px-4 py-2.5 text-muted-foreground">
                    Type
                  </th>
                  <th scope="col" className="label-micro px-4 py-2.5 text-muted-foreground">
                    Default
                  </th>
                  <th scope="col" className="label-micro px-4 py-2.5 text-muted-foreground">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.props.map((prop) => (
                  <tr key={prop.name} className="border-b border-border align-top last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-mono text-[0.8125rem] font-medium whitespace-nowrap">
                      {prop.name}
                      {prop.required ? (
                        <>
                          <span aria-hidden="true" className="text-critical">
                            *
                          </span>
                          <span className="sr-only"> (required)</span>
                        </>
                      ) : null}
                    </th>
                    <td className="px-4 py-3 font-mono text-[0.8125rem] text-muted-foreground">
                      {prop.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.8125rem] text-muted-foreground">
                      {prop.defaultValue ?? "—"}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                      {prop.description}
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
