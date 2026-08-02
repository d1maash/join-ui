import type { ComponentMetadata } from "@/types/registry"

/**
 * The single source of truth for the whole site.
 *
 * Catalog cards, component pages, docs navigation, the search index, install
 * commands, `/r/*.json` registry items, AI prompts and related-component links
 * are all projected from this array. Add a component here and it appears
 * everywhere; nothing below is repeated anywhere else in the codebase.
 *
 * To add one:
 *   1. Write the component at `registry/components/<slug>.tsx`.
 *   2. Register a demo for `<slug>` in `components/previews/registry.tsx`.
 *   3. Append a `defineComponent({ … })` record here.
 *   4. Run `pnpm registry:build` to emit `registry.json` and `public/r/*.json`.
 *
 * `defineComponent` and `uiFile` from `@/lib/registry/define` derive the
 * install command and the file descriptor, so neither is written by hand.
 */
export const components: ComponentMetadata[] = []
