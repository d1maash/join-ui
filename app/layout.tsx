import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/toaster"
import { siteConfig } from "@/lib/site"

import "./globals.css"

/*
 * Inter for everything the reader reads.
 *
 * Documentation is not a place for a typeface with a point of view. A reader
 * arrives mid-task, scans for the one paragraph they need and leaves; anything
 * the face does on its own — flared stems, a narrow cap height, an unusual `g`
 * — is friction spent on a page nobody is admiring. Inter was drawn for screen
 * UI at small sizes and disappears, which is the entire job.
 *
 * Both families are variable fonts, so the whole weight axis costs one file
 * per family. The scale is still used sparingly — 400 for prose, 500 for
 * interface labels, 600 for headings — but the restraint now lives in the
 * components rather than in what was downloaded.
 */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/*
 * JetBrains Mono for code, and for code only.
 *
 * It is a taller-x-height mono than most, which matters because the listings
 * on this site sit at 13px inside a card and have to stay readable there.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
  themeColor: "#050506",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      /*
       * The theme is a static class rather than something next-themes resolves
       * on the client. There is nothing to switch to, so the dependency bought
       * only a hydration mismatch and a blocking inline script — this renders
       * correctly with JavaScript disabled and cannot flash.
       *
       * `colorScheme` is what tells the browser to draw form controls,
       * scrollbars and the caret dark.
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
