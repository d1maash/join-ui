import { shadcnAddCommand, siteConfig } from "@/lib/site"
import type { ComponentDefinition, ComponentMetadata } from "@/types/registry"

/**
 * Normalises a component definition into full metadata.
 *
 * Everything derivable is derived here — most importantly `installCommand`, so
 * the namespace and CLI invocation live in exactly one place.
 */
export function defineComponent(definition: ComponentDefinition): ComponentMetadata {
  return {
    ...definition,
    installCommand: shadcnAddCommand(
      `${siteConfig.namespace}/${definition.slug}`,
      "pnpm"
    ),
  }
}

/** Standard registry file descriptor for a single-file UI component. */
export function uiFile(slug: string) {
  return {
    path: `registry/components/${slug}.tsx`,
    target: `${siteConfig.installTarget}/${slug}.tsx`,
    type: "registry:ui" as const,
  }
}
