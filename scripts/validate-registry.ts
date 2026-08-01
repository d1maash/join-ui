/**
 * Validates the registry before it is built or published.
 *
 * Checks the metadata against a schema *and* the things a schema cannot see:
 * that every declared file exists on disk, that `related` points at real
 * components, that every component has a registered preview, and that the
 * generated registry items still parse as valid shadcn registry items.
 *
 * Run with `pnpm registry:validate`. `pnpm registry:build` runs it first and
 * refuses to emit anything when it fails.
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import { z } from "zod"

import { components } from "@/lib/registry/components"
import { toRegistryItem } from "@/lib/registry/build"
import { COMPONENT_CATEGORIES, COMPONENT_STATUSES } from "@/types/registry"

const projectRoot = process.cwd()

const fileTypeSchema = z.enum([
  "registry:ui",
  "registry:lib",
  "registry:hook",
  "registry:component",
  "registry:file",
])

const registryItemSchema = z.object({
  $schema: z.string().url(),
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case"),
  type: fileTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  dependencies: z.array(z.string().min(1)),
  registryDependencies: z.array(z.string().min(1)),
  files: z
    .array(
      z.object({
        path: z.string().min(1),
        target: z.string().min(1),
        type: fileTypeSchema,
        content: z.string().min(1, "file content must not be empty"),
      })
    )
    .min(1),
  categories: z.array(z.string().min(1)),
  docs: z.string().url(),
  meta: z.record(z.string(), z.unknown()),
})

const metadataSchema = z.object({
  name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, "must be PascalCase"),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case"),
  title: z.string().min(1),
  description: z.string().min(10).max(160),
  overview: z.string().min(40),
  category: z.enum(COMPONENT_CATEGORIES),
  tags: z.array(z.string().min(1)).min(1),
  status: z.enum(COMPONENT_STATUSES),
  featured: z.boolean(),
  dependencies: z.array(z.string().min(1)),
  registryDependencies: z.array(z.string().min(1)),
  files: z.array(z.object({ path: z.string(), target: z.string(), type: fileTypeSchema })).min(1),
  installCommand: z.string().min(1),
  accessibility: z.array(z.string().min(1)).min(1),
  keyboard: z.array(
    z.object({ keys: z.array(z.string().min(1)).min(1), description: z.string().min(1) })
  ),
  props: z
    .array(
      z.object({
        name: z.string().min(1),
        props: z
          .array(
            z.object({
              name: z.string().min(1),
              type: z.string().min(1),
              description: z.string().min(1),
            })
          )
          .min(1),
      })
    )
    .min(1),
  usage: z.string().min(20),
  customization: z.array(z.object({ title: z.string(), code: z.string().min(5) })),
  related: z.array(z.string()),
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date"),
})

async function exists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectRoot, relativePath))
    return true
  } catch {
    return false
  }
}

/**
 * The preview map is a Client Component module, so it cannot be imported here.
 * Reading the registered slugs out of its source keeps the check honest without
 * dragging React into the script.
 */
async function getRegisteredPreviews(): Promise<Set<string>> {
  const source = await fs.readFile(
    path.join(projectRoot, "components", "previews", "registry.tsx"),
    "utf8"
  )
  const slugs = new Set<string>()
  for (const match of source.matchAll(/"([a-z0-9-]+)":\s*dynamic\(/g)) {
    const slug = match[1]
    if (slug) slugs.add(slug)
  }
  return slugs
}

export async function validateRegistry(): Promise<string[]> {
  const issues: string[] = []

  const slugs = new Set<string>()
  const previews = await getRegisteredPreviews()

  for (const component of components) {
    const label = component.slug || component.name || "<unnamed>"

    const parsed = metadataSchema.safeParse(component)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push(`${label}: ${issue.path.join(".")} — ${issue.message}`)
      }
    }

    if (slugs.has(component.slug)) {
      issues.push(`${label}: duplicate slug`)
    }
    slugs.add(component.slug)

    for (const file of component.files) {
      if (!(await exists(file.path))) {
        issues.push(`${label}: declared file "${file.path}" does not exist`)
      }
    }

    if (!previews.has(component.slug)) {
      issues.push(
        `${label}: no preview registered in components/previews/registry.tsx`
      )
    }

    if (component.installCommand.includes("undefined")) {
      issues.push(`${label}: installCommand looks malformed`)
    }
  }

  // `related` must point at components that exist, and never at itself.
  for (const component of components) {
    for (const slug of component.related) {
      if (slug === component.slug) {
        issues.push(`${component.slug}: related references itself`)
      } else if (!slugs.has(slug)) {
        issues.push(`${component.slug}: related references unknown slug "${slug}"`)
      }
    }
  }

  // Finally, the generated artefacts must satisfy the registry-item schema.
  if (issues.length === 0) {
    for (const component of components) {
      const item = await toRegistryItem(component)
      const parsed = registryItemSchema.safeParse(item)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          issues.push(
            `${component.slug}: generated item invalid — ${issue.path.join(".")} ${issue.message}`
          )
        }
      }
    }
  }

  return issues
}

async function main(): Promise<void> {
  const issues = await validateRegistry()

  if (issues.length > 0) {
    console.error(`Registry validation failed with ${issues.length} issue(s):\n`)
    for (const issue of issues) console.error(`  ✗ ${issue}`)
    process.exit(1)
  }

  console.log(
    `✓ Registry valid — ${components.length} components, all files present, all previews registered`
  )
}

// Only run the CLI path when invoked directly, not when imported by the builder.
if (process.argv[1]?.includes("validate-registry")) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
}
