import type { MetadataRoute } from "next"

import { docsPages } from "@/lib/docs/nav"
import { allComponents } from "@/lib/registry"
import { siteConfig } from "@/lib/site"

/**
 * Sitemap derived from the same sources as the navigation, so a new component
 * or guide is indexed without a second registration step.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.url}/components`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  const docs: MetadataRoute.Sitemap = docsPages.map((page) => ({
    url: `${siteConfig.url}${page.href}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const components: MetadataRoute.Sitemap = allComponents.map((component) => ({
    url: `${siteConfig.url}/components/${component.slug}`,
    lastModified: new Date(`${component.since}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...docs, ...components]
}
