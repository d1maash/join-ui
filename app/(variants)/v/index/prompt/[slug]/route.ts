import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"

/*
 * The agent prompt for one component, as a static text file generated at
 * build time. Cells across the variant fetch it when a reader reaches for
 * their Prompt button, so pages with hundreds of cells never inline hundreds
 * of prompts (each one carries the component's full source).
 */
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return new Response("Not found", { status: 404 })

  const prompt = buildComponentPrompt({ component, sources: await getComponentSources(component) })
  return new Response(prompt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
