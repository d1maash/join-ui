import type { IxBadge } from "./codes"

/** Boxed flag — cells, page headers, the catalog table. */
export function IxBadgeTag({ badge }: { badge: IxBadge }) {
  return (
    <span className="ix-badge" data-badge={badge}>
      {badge}
    </span>
  )
}

/** Bare flag — a word in a row, as in the index and the sidebar. */
export function IxFlag({ badge }: { badge: IxBadge | null | undefined }) {
  if (!badge) return null
  return (
    <span className="ix-flag" data-badge={badge}>
      {badge}
    </span>
  )
}
