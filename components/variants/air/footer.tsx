import Link from "next/link"

import { docsPages } from "@/lib/docs/nav"
import { componentsByName } from "@/lib/registry"
import { siteConfig } from "@/lib/site"
import { variantBase } from "@/lib/variants"

import { FooterCrumbs } from "./footer-crumbs"
import { air } from "./href"

const doc = (slug: string) => {
  const page = docsPages.find((item) => item.slug === slug)
  return page ? { label: page.title, href: air(page.href) } : null
}

/*
 * Apple's footer: a #f5f5f7 band of 12px type, a breadcrumb, a directory of
 * short columns, then the legal line. Everything in it is a plain link.
 */
export function AirFooter() {
  const columns = [
    {
      title: "Components",
      links: [
        { label: "All components", href: air("/components") },
        ...componentsByName.map((component) => ({
          label: component.title,
          href: air(`/components/${component.slug}`),
        })),
      ],
    },
    {
      title: "Get started",
      links: ["introduction", "installation", "project-setup", "shadcn-setup", "registry-setup"]
        .map(doc)
        .filter((link) => link !== null),
    },
    {
      title: "Make it yours",
      links: ["theming", "dark-mode", "tailwind-setup"]
        .map(doc)
        .filter((link) => link !== null),
    },
    {
      title: "Guides",
      links: ["accessibility", "ai", "contributing"].map(doc).filter((link) => link !== null),
    },
    {
      title: "Project",
      links: [
        { label: "GitHub", href: siteConfig.links.github },
        { label: "Issues", href: siteConfig.links.issues },
        { label: "Registry JSON", href: "/r/registry.json" },
      ],
    },
  ]

  const base = variantBase("air")
  const titles: Record<string, string> = {
    [air("/components")]: "Components",
    [air("/docs")]: "Docs",
    ...Object.fromEntries(
      componentsByName.map((component) => [
        air(`/components/${component.slug}`),
        component.title,
      ])
    ),
    ...Object.fromEntries(docsPages.map((page) => [air(page.href), page.title])),
  }

  return (
    <footer className="bg-[#f5f5f7] text-[12px] leading-[1.33] text-[#6e6e73]">
      <div className="mx-auto max-w-[61.25rem] px-5 pt-5 pb-28 sm:px-6">
        <p className="border-b border-[#d2d2d7] pb-4 leading-[1.5]">
          Join UI is an open-code catalog. Components are installed as source files into
          your project through the shadcn CLI, and are released under the MIT licence.
          Previews on this site run the same code the CLI installs.
        </p>

        <div className="pt-4">
          <FooterCrumbs base={base} titles={titles} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-7 pt-6 pb-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2.5 font-semibold text-[#1d1d1f]">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http")
                  const className =
                    "rounded-sm text-[#424245] hover:text-[#1d1d1f] hover:underline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={className}
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-[#d2d2d7] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} {siteConfig.author}. Released under
            the MIT licence.
          </p>
          <ul className="flex flex-wrap items-center gap-x-0 text-[#424245]">
            {[
              { label: "Contributing", href: air("/docs/contributing") },
              { label: "Source on GitHub", href: siteConfig.links.repo },
              { label: "Report an issue", href: siteConfig.links.issues },
            ].map((link, index) => (
              <li
                key={link.label}
                className={index > 0 ? "border-l border-[#d2d2d7] pl-2.5 ml-2.5" : ""}
              >
                {link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
