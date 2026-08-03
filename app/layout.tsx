import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"

import { Toaster } from "@/components/ui/toaster"
import { siteConfig } from "@/lib/site"

import "./globals.css"

/*
 * IBM Plex rather than Inter.
 *
 * Inter is the correct answer often enough that it has become the default
 * answer, and a page set in it at tight tracking reads as unattended — the
 * typeface is doing nothing the layout did not already do. Plex was drawn for
 * an engineering company and shows it: flared stems, a true single-storey `g`,
 * slightly narrow caps. It has opinions, which is the point.
 *
 * The mono is its sibling rather than a second family, so the mono labels, the
 * numerals and the code all sit on the same skeleton as the prose.
 *
 * Only three weights are loaded. A wider range invites the middle of a scale to
 * be used for emphasis, which is how a hierarchy stops meaning anything.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
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
  themeColor: "#141210",
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
      className={`dark ${plexSans.variable} ${plexMono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
