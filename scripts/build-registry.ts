/**
 * Generates the shadcn-compatible registry.
 *
 * Outputs:
 *   registry.json          — source registry (input format for `shadcn build`)
 *   public/r/registry.json — public index, served at /r/registry.json
 *   public/r/<name>.json   — one installable item per component, with sources
 *
 * Run with `pnpm registry:build`. It also runs automatically before
 * `pnpm build`, so the published site can never serve a stale registry.
 */
import { promises as fs } from "node:fs"
import path from "node:path"

import { components } from "@/lib/registry/components"
import {
  buildRegistryIndex,
  buildSourceRegistry,
  toRegistryItem,
} from "@/lib/registry/build"
import { validateRegistry } from "@/scripts/validate-registry"

const projectRoot = process.cwd()
const OUTPUT_DIR = path.join(projectRoot, "public", "r")

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function main(): Promise<void> {
  const issues = await validateRegistry()
  if (issues.length > 0) {
    console.error("Registry validation failed:\n")
    for (const issue of issues) console.error(`  ✗ ${issue}`)
    process.exitCode = 1
    return
  }

  await fs.rm(OUTPUT_DIR, { recursive: true, force: true })
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  await writeJson(path.join(projectRoot, "registry.json"), buildSourceRegistry())
  await writeJson(path.join(OUTPUT_DIR, "registry.json"), buildRegistryIndex())

  const items = await Promise.all(components.map(toRegistryItem))
  await Promise.all(
    items.map((item) => writeJson(path.join(OUTPUT_DIR, `${item.name}.json`), item))
  )

  const totalBytes = items.reduce(
    (sum, item) =>
      sum + item.files.reduce((inner, file) => inner + file.content.length, 0),
    0
  )

  console.log(
    `✓ Registry built — ${items.length} items, ${(totalBytes / 1024).toFixed(1)} kB of source`
  )
  console.log(`  registry.json`)
  console.log(`  public/r/registry.json`)
  console.log(`  public/r/*.json (${items.length} files)`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
