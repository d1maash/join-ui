/**
 * Copies a fenced block's meta string onto the `<code>` element's props.
 *
 * MDX parses ```` ```tsx title="button.tsx" {3-5} ```` into `node.data.meta`,
 * which is dropped by the time it reaches React. Lifting it into `properties`
 * lets the `pre` renderer read titles, highlighted-line ranges and
 * `showLineNumbers` without re-parsing the raw markdown.
 *
 * Written against a structural guard rather than pulling in
 * `unist-util-visit` and `@types/hast` for one small walk.
 */
interface CodeLikeNode {
  type: string
  tagName?: string
  data?: { meta?: string }
  properties?: Record<string, unknown>
  children?: unknown[]
}

function isNode(value: unknown): value is CodeLikeNode {
  return typeof value === "object" && value !== null && "type" in value
}

function walk(node: unknown): void {
  if (!isNode(node)) return

  if (node.type === "element" && node.tagName === "code" && node.data?.meta) {
    node.properties = { ...node.properties, "data-meta": node.data.meta }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child)
  }
}

export function rehypeCodeMeta() {
  return (tree: unknown): void => {
    walk(tree)
  }
}
