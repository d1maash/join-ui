# Join UI

[![CI](https://github.com/d1maash/join-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/d1maash/join-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An open-code catalog of motion-first React components for Next.js, with a
shadcn-compatible registry and a generated AI prompt for every component.

**[ui.join-way.com](https://ui.join-way.com)** — catalog, docs and registry.

Components are not imported from a package. The shadcn CLI writes real `.tsx`
files into your project, which you then own outright — read them, edit them,
delete what you do not need.

- **Real registry** — `/r/registry.json` plus one installable item per component
- **Copy Prompt** — a structured, agent-ready brief on every component page
- **Two-layer design system** — an entirely neutral chrome (emphasis by ink and
  elevation rather than by an accent; neither ramp reaches pure black or pure
  white) around components that take their hue from the `--info` / `--positive`
  / `--caution` / `--critical` token families. The site renders dark only; the
  tokens ship both themes, because installed components land in light projects
  too
- **WCAG 2.2 AA** baseline, with reduced-motion fallbacks throughout
- **Fully static** — every route prerendered, no runtime services

The catalog is young: the component set is being rebuilt against the current
design system one component at a time. The registry pipeline, documentation,
search index and JSON endpoints are all in place, and a component appears across
every surface as soon as it is added to `lib/registry/components.ts`.

---

## Getting started

Requires **Node.js 20.9+** and **pnpm 10+**.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### Production build

```bash
pnpm build     # runs registry:build first, then next build
pnpm start
```

### Scripts

| Script                   | What it does                                         |
| ------------------------ | ---------------------------------------------------- |
| `pnpm dev`               | Development server                                   |
| `pnpm build`             | Regenerates the registry, then builds for production |
| `pnpm start`             | Serves the production build                          |
| `pnpm lint`              | ESLint                                               |
| `pnpm typecheck`         | `tsc --noEmit`                                       |
| `pnpm registry:build`    | Regenerates `registry.json` and `public/r/*.json`    |
| `pnpm registry:validate` | Schema-checks metadata, files, previews and links    |
| `pnpm check`             | Validate + typecheck + lint                          |
| `pnpm format`            | Prettier                                             |

---

## Directory structure

```text
app/
  (site)/                       # header + footer shell
    (marketing)/page.tsx        # /
    components/page.tsx         # /components — catalog
    components/[slug]/          # /components/[slug] + per-component OG image
    docs/[[...slug]]/           # /docs and /docs/[slug]
  (preview)/preview/[slug]/     # bare full-page previews
  layout.tsx                    # html, fonts, metadata, toaster
  globals.css                   # design tokens + Tailwind theme
  opengraph-image.tsx           # site-wide social card
  icon.png, apple-icon.png, favicon.ico   # brand marks, picked up by convention
  manifest.ts, sitemap.ts, robots.ts, not-found.tsx
components/
  site/                         # documentation chrome (header, sidebar, code blocks…)
  previews/                     # one live demo per component + the lazy map
  ui/                           # local shadcn-style primitives
content/
  docs/                         # MDX guides — content only, no frontmatter
lib/
  registry/                     # metadata, helpers, build + catalog projections
  prompts/build-prompt.ts       # AI prompt generation
  search/                       # local search index and scorer
  docs/                         # navigation and sidebar trees
  mdx/                          # MDX loading, TOC extraction, rehype plugin
  highlight.ts, shiki-theme.ts  # Shiki, and the two low-chroma syntax themes
  commands.ts, hooks.ts, site.ts, clipboard.ts, utils.ts
registry/
  components/                   # the components the CLI ships
public/
  r/                            # generated registry items (git-ignored)
scripts/
  build-registry.ts, validate-registry.ts
types/
  registry.ts                   # the content model
```

### The separation that matters

| Directory              | Rule                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `registry/components/` | Ships to other people's projects. May only import `react`, its declared npm dependencies, and `@/lib/utils`. |
| `components/previews/` | Demos. Never leave this site, so they may import anything.                                                   |
| `components/site/`     | Documentation chrome. Never shipped by the registry.                                                         |
| `components/ui/`       | Local primitives for the docs. Deliberately separate from registry components.                               |

### Brand assets

The wordmark and the monogram both live in `components/site/logo.tsx`. The mark
is vector, drawn on `currentColor` rather than as an image, so it inherits from
the text beside it and stays crisp at any size. Its two paths are exported as
`MARK` and reused by the social cards, which Satori renders without CSS — there
is one copy of the geometry, not three.

`app/icon.png`, `app/apple-icon.png` and `app/favicon.ico` are the Join Way
originals, copied verbatim from the studio site so a browser tab, an installed
shortcut and join-way.com all show the same tile. Next picks all three up by file
convention, and `app/manifest.ts` points at the same PNG.

---

## Adding a new component

Four files. Everything else — catalog card, sidebar entry, search, registry
item, AI prompt, sitemap — is derived.

### 1. Write the component

`registry/components/<slug>.tsx`

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlowCardProps extends React.ComponentPropsWithoutRef<"div"> {
  intensity?: number
}

export function GlowCard({ intensity = 1, className, ...props }: GlowCardProps) {
  return (
    <div
      className={cn("border border-border bg-card p-5", className)}
      {...props}
    />
  )
}
```

House rules:

- Theme through **tokens only — no `dark:` variants** (see below).
- Accept and merge `className` through `cn`, always last.
- Export the props interface.
- Animate `transform` and `opacity` only; handle `prefers-reduced-motion`.
- Add `"use client"` only if the component genuinely needs state, refs, effects
  or browser APIs.

### 2. Write a preview

`components/previews/<slug>-preview.tsx`, default export:

```tsx
"use client"

import { GlowCard } from "@/registry/components/glow-card"

export default function GlowCardPreview() {
  return <GlowCard className="max-w-sm">Preview content</GlowCard>
}
```

Register it in `components/previews/registry.tsx` so it code-splits:

```tsx
const GlowCardPreview = dynamic(() => import("./glow-card-preview"))

export const previews: Record<string, () => ReactNode> = {
  "glow-card": () => <GlowCardPreview />,
}
```

### 3. Describe it

One entry in `lib/registry/components.ts` — the single source of truth:

```ts
defineComponent({
  name: "GlowCard",
  slug: "glow-card",
  title: "Glow Card",
  description: "A card with a soft animated glow.",
  overview: "Two to four sentences. Reused on the page and in the AI prompt.",
  category: "Cards",
  tags: ["card", "glow"],
  status: "new",
  featured: false,
  dependencies: [],
  registryDependencies: ["utils"],
  files: [uiFile("glow-card")],
  accessibility: ["Decorative layers are aria-hidden and pointer-events-none."],
  keyboard: [],
  props: [{ name: "GlowCard", props: [/* … */] }],
  usage: `import { GlowCard } from "@/components/joinui/glow-card"`,
  customization: [],
  related: [],
  since: "2026-08-02",
})
```

`installCommand` is derived by `defineComponent` — never write it by hand.

### 4. Validate

```bash
pnpm registry:validate
pnpm check
```

Validation fails loudly if a declared file is missing, the preview is not
registered, `related` points at an unknown slug, the slug is not kebab-case, or
the description exceeds 160 characters.

---

## Adding an MDX page

Two steps.

1. Create `content/docs/<slug>.mdx`. **No frontmatter** — title and description
   live in the navigation, so there is nothing to keep in sync.
2. Register it in `lib/docs/nav.ts`:

   ```ts
   item("my-page", "My page", "One-line description for search and metadata.")
   ```

That single entry drives the sidebar, breadcrumbs, previous/next links, the
search index, the sitemap and `generateStaticParams`.

### Components available inside MDX

| Component                                            | Use                               |
| ---------------------------------------------------- | --------------------------------- |
| `<Callout type="note \| tip \| warning \| success">` | Highlighted aside                 |
| `<Steps>` / `<Step title="…">`                       | Numbered walkthrough              |
| `<CardGroup>` / `<Card title href>`                  | Linkable card grid                |
| `<InstallTabs target="@joinui/name" />`             | `shadcn add`, per package manager |
| `<DependencyTabs packages="motion clsx" />`          | `install`, per package manager    |
| `<ComponentPreview slug title />`                    | Live preview                      |
| `<Kbd>` / `<Badge>`                                  | Inline key and status chips       |

Fenced blocks support a filename, highlighted lines and line numbers:

````text
```tsx title="button.tsx" {2,5-7} showLineNumbers
````

---

## Adding a registry item

Registry items are **generated**, never hand-written. `pnpm registry:build`
projects them from component metadata and emits:

| Output                   | Contents                                          |
| ------------------------ | ------------------------------------------------- |
| `registry.json`          | Source registry (input format for `shadcn build`) |
| `public/r/registry.json` | Public index — every item, without file bodies    |
| `public/r/<name>.json`   | One installable item, with full source inlined    |

```bash
pnpm registry:build
```

```text
✓ Registry built — 1 items, 13.2 kB of source
```

Consumers install by namespace:

```bash
pnpm dlx shadcn@latest add @joinui/glow-card
```

…or straight from a URL, with nothing configured:

```bash
pnpm dlx shadcn@latest add https://ui.join-way.com/r/glow-card.json
```

To consume the namespace, add it to `components.json`:

```json
{
  "registries": {
    "@joinui": "https://ui.join-way.com/r/{name}.json"
  }
}
```

---

## Configuring the AI prompt

Every component page has a **Copy prompt** button. The prompt is assembled on
the server in `lib/prompts/build-prompt.ts` from the component's metadata plus
the real source file on disk, so it can never describe a prop that does not
exist, and the code it carries is byte-identical to what the CLI installs.

It includes the stack, install path, dependencies, registry dependencies, every
supported prop, accessibility and keyboard requirements, animation constraints,
integration guard rails ("do not modify unrelated files", "keep strict mode
passing"), a usage example, and the full implementation.

To override the generated text for one component, set `prompt` on its metadata:

```ts
defineComponent({
  name: "GlowCard",
  // …
  prompt: `Add the GlowCard component…`,
})
```

Use it sparingly — a hand-written prompt is one more thing that can drift from
the implementation.

---

## Publishing the registry

`prebuild` regenerates `public/r/` before every production build, so deploying
the site publishes the registry:

```bash
pnpm build
```

`public/r/*` is served as static JSON with `Access-Control-Allow-Origin: *`
(configured in `next.config.ts`), so the shadcn CLI can read it from any
project. Any static host works, including an object store behind a CDN.

`lib/site.ts` already falls back to the production origin, so a deployment to
`ui.join-way.com` needs no configuration. Set `NEXT_PUBLIC_SITE_URL` anywhere
else — a preview deployment, a fork, a self-hosted registry — so canonical URLs,
OG tags, the sitemap and the registry `docs` links point at that origin instead:

```bash
NEXT_PUBLIC_SITE_URL=https://ui.example.com pnpm build
```

For a private registry, the CLI supports per-registry headers:

```json
{
  "registries": {
    "@acme": {
      "url": "https://design.acme.com/r/{name}.json",
      "headers": { "Authorization": "Bearer ${ACME_TOKEN}" }
    }
  }
}
```

---

## Architecture notes

**One source of truth.** Catalog cards, component pages, sidebar navigation, the
search index, install commands, registry items, AI prompts and the sitemap are
all projected from `lib/registry/components.ts`. Nothing is duplicated, and
`registry:validate` enforces the invariants a type system cannot.

**Server-first.** Highlighting (Shiki), prompt assembly, the search index and
the sidebar tree are all computed at build time. Client Components are limited
to genuinely interactive pieces — clipboard, tab switchers, the command palette,
the catalog filter and the previews themselves.

**No `dark:` in registry components.** Registry components theme purely through
CSS custom properties. That is what makes them portable: dropped into a light
project, or into any subtree that redeclares the variables, they resolve
correctly because custom-property inheritance already means "nearest wins". A
`dark:` variant would match on `.dark *` and win anyway.

**Previews are the real thing.** Every preview imports from
`registry/components/`, and every code block reads that same file from disk at
build time. There is no simplified demo build to drift.

**Lazy where it matters.** Each preview is a separate `next/dynamic` import, and
catalog cards only mount their demo once the card approaches the viewport.

---

## Contributing

Contributions are welcome — components, fixes and documentation alike. Read
[CONTRIBUTING.md](CONTRIBUTING.md) for the repository workflow, and
[/docs/contributing](https://ui.join-way.com/docs/contributing) for the four
files a component takes and the house rules it has to satisfy.

For anything larger than a bug fix, open an issue first. A component that does
not fit the design system is a painful thing to reject after it has been built.

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
Security problems go to [SECURITY.md](SECURITY.md) — privately, never as a
public issue.

---

## License

[MIT](LICENSE) © Join Way and contributors.

Components installed through the CLI become source files in your project. You
own them: edit, rewrite or delete them, with no attribution required in your
own product.
