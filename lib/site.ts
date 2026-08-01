export const siteConfig = {
  name: "Joinway UI",
  shortName: "Joinway",
  /** shadcn CLI namespace: `pnpm dlx shadcn@latest add @joinway/<name>`. */
  namespace: "@joinway",
  registryName: "joinway",
  tagline: "Motion-first React components you actually own.",
  description:
    "An open-code catalog of accessible, animated React components for Next.js. Install through the shadcn CLI, copy the source, or hand a ready-made prompt to your AI coding agent.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ui.joinway.dev",
  ogImage: "/opengraph-image",
  author: "Joinway",
  links: {
    github: "https://github.com/joinway/ui",
    repo: "https://github.com/joinway/ui",
    issues: "https://github.com/joinway/ui/issues",
    contributing: "/docs/contributing",
  },
  /** Where the CLI drops component files inside a consumer project. */
  installTarget: "components/joinway",
} as const

export type SiteConfig = typeof siteConfig

export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

/** `shadcn` CLI invocation for each supported package manager. */
export function shadcnAddCommand(target: string, pm: PackageManager): string {
  switch (pm) {
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${target}`
    case "npm":
      return `npx shadcn@latest add ${target}`
    case "yarn":
      return `yarn dlx shadcn@latest add ${target}`
    case "bun":
      return `bunx --bun shadcn@latest add ${target}`
  }
}

/** `install` invocation for each supported package manager. */
export function installCommand(packages: string[], pm: PackageManager): string {
  const list = packages.join(" ")
  switch (pm) {
    case "pnpm":
      return `pnpm add ${list}`
    case "npm":
      return `npm install ${list}`
    case "yarn":
      return `yarn add ${list}`
    case "bun":
      return `bun add ${list}`
  }
}
