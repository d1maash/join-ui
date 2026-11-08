import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/toaster"
import { siteConfig } from "@/lib/site"

import "./globals.css"

/*
 * Geist for everything the reader reads, Geist Mono for anything a machine
 * would also read — a listing, a prop name, a package command.
 *
 * Both are variable fonts, so the whole weight axis costs one file per family.
 * They are declared here rather than in the site layout so the full-screen
 * preview and the root 404, which sit outside it, set in the same faces.
 */
const sans = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
  display: "swap",
})

const mono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.links.github }],
  creator: siteConfig.author,
  keywords: [
    "react components",
    "next.js",
    "tailwind css",
    "shadcn registry",
    "ui library",
    "motion",
    "accessible components",
    "copy paste components",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export const viewport: Viewport = {
  // The site renders dark only, so there is one answer here rather than a pair.
  themeColor: "#09090b",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      /*
       * The theme is a static class rather than something resolved on the
       * client: there is nothing to switch to, so this renders correctly with
       * JavaScript disabled and cannot flash. `colorScheme` tells the browser
       * to draw form controls, scrollbars and the caret dark.
       */
      className={`dark ${sans.variable} ${mono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
