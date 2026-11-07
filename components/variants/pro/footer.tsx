import Link from "next/link"

import { docsNav } from "@/lib/docs/nav"
import { componentsByName } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

import { proHref } from "./href"

/*
 * The apple.com footer: 12px type, quiet columns, one hairline, the legal
 * line at the bottom. It is reference, not a last pitch.
 */
export function ProFooter() {
  const columns = [
    {
      title: "Components",
      links: componentsByName.map((component) => ({
        label: component.title,
        href: proHref(`/components/${component.slug}`),
      })),
    },
    ...docsNav.map((section) => ({
      title: section.title,
      links: section.items.map((page) => ({ label: page.title, href: proHref(page.href) })),
    })),
    {
      title: "Project",
      links: [
        { label: "GitHub", href: siteConfig.links.github },
        { label: "Issues", href: siteConfig.links.issues },
        { label: "Contributing", href: proHref("/docs/contributing") },
      ],
    },
  ]

  return (
    <footer className="bg-[#161617] text-[12px] leading-[1.33] tracking-[-0.01em] text-[#86868b]">
      <div className="mx-auto max-w-[1024px] px-4 pt-10 pb-28 sm:px-[22px]">
        <p className="border-b border-white/[0.12] pb-4 text-pretty">
          Join UI is an open-code catalog. Every component is MIT licensed and installs
          as source into your own repository through the shadcn CLI, under the{" "}
          <span className="text-[#d2d2d7]">{siteConfig.namespace}</span> namespace.
        </p>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2.5 font-semibold text-[#e8e8ed]">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http")
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="rounded-sm text-[#a1a1a6] hover:text-[#f5f5f7] hover:underline"
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="rounded-sm text-[#a1a1a6] hover:text-[#f5f5f7] hover:underline"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/[0.12] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.name} by {siteConfig.author}. MIT licence.
          </p>
          <p>Built with Next.js, Tailwind CSS and Motion.</p>
        </div>
      </div>
    </footer>
  )
}
