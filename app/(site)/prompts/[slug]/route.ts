import { buildComponentPrompt } from "@/lib/prompts/build-prompt"
import { allComponents, getComponent } from "@/lib/registry"
import { getComponentSources } from "@/lib/registry/source"

/*
 * The agent brief for one component, as a prerendered text file. Cards copy
 * from here so a catalog page never ships every component's source inline.
 */
export const dynamic = "force-static"

export function generateStaticParams() {
  return allComponents.map((component) => ({ slug: component.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) return new Response("Not found", { status: 404 })

  const sources = await getComponentSources(component)
  const prompt = buildComponentPrompt({ component, sources })

  return new Response(prompt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
