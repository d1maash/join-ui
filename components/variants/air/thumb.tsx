import { ComponentThumb } from "@/components/previews/thumbs/registry"
import { cn } from "@/lib/utils"

/*
 * A live miniature of a component, as a picture. `inert` keeps every control
 * inside it out of the tab order and away from the pointer; `aria-hidden`
 * keeps it out of the accessibility tree, because the card around it already
 * names the component.
 */
export function AirThumb({ slug, className }: { slug: string; className?: string }) {
  return (
    <div inert aria-hidden="true" className={cn("air-thumb relative overflow-hidden", className)}>
      <ComponentThumb slug={slug} />
    </div>
  )
}
