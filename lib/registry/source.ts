import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { cache } from "react"

import type { ComponentMetadata } from "@/types/registry"

const projectRoot = process.cwd()

export interface SourceFile {
  /** Repository-relative path. */
  path: string
  /** Destination inside a consumer project. */
  target: string
  /** Basename shown on the code block tab. */
  name: string
  content: string
  language: string
}

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".css": "css",
  ".json": "json",
}

/**
 * Reads a registry file straight from disk.
 *
 * The docs render the exact bytes the CLI ships — there is no second copy of
 * the source in MDX or in a generated constant that could drift.
 */
export const readSourceFile = cache(async (relativePath: string): Promise<string> => {
  const absolute = path.join(projectRoot, relativePath)
  return fs.readFile(absolute, "utf8")
})

export const getComponentSources = cache(
  async (component: ComponentMetadata): Promise<SourceFile[]> => {
    return Promise.all(
      component.files.map(async (file) => ({
        path: file.path,
        target: file.target,
        name: path.basename(file.path),
        content: await readSourceFile(file.path),
        language: LANGUAGE_BY_EXTENSION[path.extname(file.path)] ?? "tsx",
      }))
    )
  }
)

/** Primary source file — the one shown by default on the Code tab. */
export async function getPrimarySource(
  component: ComponentMetadata
): Promise<SourceFile> {
  const sources = await getComponentSources(component)
  const first = sources[0]
  if (!first) {
    throw new Error(`Component "${component.slug}" declares no files.`)
  }
  return first
}
