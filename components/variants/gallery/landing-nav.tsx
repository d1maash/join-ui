"use client"

import * as React from "react"
import Link from "next/link"

import { GalleryLogo } from "@/components/variants/gallery/rail"
import { SearchField, SearchIconButton } from "@/components/variants/gallery/search"
import { GitHubLink, MobileMenu } from "@/components/variants/gallery/top-bar"
import { cn } from "@/lib/utils"

import type { GalleryNav } from "@/components/variants/gallery/data"
import { g } from "@/components/variants/gallery/links"

/*
 * The landing page's bar: transparent over the hero, a blurred hairline
 * strip once the page has moved.
 */
export function LandingNav({ nav }: { nav: GalleryNav }) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { label: "Components", href: g("/components") },
    { label: "Categories", href: "#categories" },
    { label: "New", href: g("/components?status=new") },
    { label: "Docs", href: g("/docs") },
  ]

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-[var(--g-line)] bg-[rgb(9_9_11/0.78)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[var(--g-top)] max-w-[80rem] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <GalleryLogo />
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium text-[var(--g-ink-2)] transition-colors hover:text-[var(--g-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchField label="Search" className="mr-1 hidden h-8 w-52 md:flex" />
          <SearchIconButton className="md:hidden" />
          <GitHubLink />
          <Link href={g("/docs/installation")} className="g-btn g-btn-accent ml-1 h-8 px-3">
            Install
          </Link>
          <MobileMenu nav={nav} className="ml-1 md:hidden" />
        </div>
      </div>
    </header>
  )
}
