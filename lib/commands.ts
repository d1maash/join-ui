import {
  installCommand,
  PACKAGE_MANAGERS,
  shadcnAddCommand,
  type PackageManager,
} from "@/lib/site"

export type CommandSet = Record<PackageManager, string>

function forEachManager(build: (pm: PackageManager) => string): CommandSet {
  return Object.fromEntries(PACKAGE_MANAGERS.map((pm) => [pm, build(pm)])) as CommandSet
}

/** `shadcn add <target>` for every supported package manager. */
export function shadcnCommands(target: string): CommandSet {
  return forEachManager((pm) => shadcnAddCommand(target, pm))
}

/** `add <packages>` for every supported package manager. */
export function dependencyCommands(packages: string[]): CommandSet {
  return forEachManager((pm) => installCommand(packages, pm))
}
