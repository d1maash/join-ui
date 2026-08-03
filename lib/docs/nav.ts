export interface DocsNavItem {
  title: string
  slug: string
  href: string
  description: string
  label?: "New" | "Updated"
}

export interface DocsNavSection {
  title: string
  items: DocsNavItem[]
}

function item(
  slug: string,
  title: string,
  description: string,
  label?: DocsNavItem["label"]
): DocsNavItem {
  return { slug, title, description, href: `/docs/${slug}`, label }
}

/**
 * The documentation outline. Sidebar, mobile nav, previous/next links, search
 * results, the sitemap and `generateStaticParams` all read from here — adding a
 * page means adding one entry plus the matching MDX file.
 */
export const docsNav: DocsNavSection[] = [
  {
    title: "Getting Started",
    items: [
      item("introduction", "Introduction", "What Join UI is and how it is built."),
      item("installation", "Installation", "Add Join UI to a new or existing app."),
      item(
        "project-setup",
        "Project setup",
        "Directory layout, aliases and conventions."
      ),
      item(
        "tailwind-setup",
        "Tailwind setup",
        "Tailwind CSS v4 tokens and the dark variant."
      ),
      item("shadcn-setup", "shadcn setup", "components.json and the CLI."),
      item("registry-setup", "Registry setup", "Consume or self-host the registry."),
    ],
  },
  {
    title: "Customization",
    items: [
      item("theming", "Theming", "Design tokens, palettes and radius."),
      item(
        "dark-mode",
        "Dark mode",
        "Theme switching in your project, and scoped theme islands."
      ),
    ],
  },
  {
    title: "Guides",
    items: [
      item(
        "accessibility",
        "Accessibility",
        "The WCAG 2.2 AA baseline every component meets."
      ),
      item(
        "ai",
        "Using components with AI",
        "Copy Prompt, and how the prompt is built.",
        "New"
      ),
      item("contributing", "Contributing", "Add a component end to end."),
    ],
  },
]

export const docsPages: DocsNavItem[] = docsNav.flatMap((section) => section.items)

export const docsSlugs: string[] = docsPages.map((page) => page.slug)

/** The page served at `/docs`. */
export const DOCS_INDEX_SLUG = "introduction"

export function getDocsPage(slug: string): DocsNavItem | undefined {
  return docsPages.find((page) => page.slug === slug)
}

export function getDocsSiblings(slug: string): {
  previous: DocsNavItem | undefined
  next: DocsNavItem | undefined
} {
  const index = docsPages.findIndex((page) => page.slug === slug)
  if (index === -1) return { previous: undefined, next: undefined }
  return { previous: docsPages[index - 1], next: docsPages[index + 1] }
}

export function getSectionForSlug(slug: string): DocsNavSection | undefined {
  return docsNav.find((section) => section.items.some((page) => page.slug === slug))
}
