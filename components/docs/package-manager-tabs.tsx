import { PackageManagerTabsClient } from "@/components/docs/package-manager-tabs-client"
import { highlightCode } from "@/lib/highlight"
import {
  installCommand,
  PACKAGE_MANAGERS,
  shadcnAddCommand,
  type PackageManager,
} from "@/lib/site"

type CommandMap = Record<PackageManager, string>

/** `shadcn add` for every package manager. */
export function shadcnCommands(target: string): CommandMap {
  return Object.fromEntries(
    PACKAGE_MANAGERS.map((manager) => [manager, shadcnAddCommand(target, manager)])
  ) as CommandMap
}

/** `install` for every package manager. */
export function dependencyCommands(packages: string[]): CommandMap {
  return Object.fromEntries(
    PACKAGE_MANAGERS.map((manager) => [manager, installCommand(packages, manager)])
  ) as CommandMap
}

export interface PackageManagerTabsProps {
  commands: CommandMap
  className?: string
  label?: string
}

/**
 * Server wrapper that highlights all four commands up front, so switching
 * managers costs nothing at runtime.
 */
export async function PackageManagerTabs({
  commands,
  className,
  label,
}: PackageManagerTabsProps) {
  const entries = await Promise.all(
    PACKAGE_MANAGERS.map(
      async (manager) =>
        [manager, await highlightCode(commands[manager], { language: "bash" })] as const
    )
  )

  return (
    <PackageManagerTabsClient
      commands={commands}
      html={Object.fromEntries(entries) as CommandMap}
      className={className}
      label={label}
    />
  )
}
