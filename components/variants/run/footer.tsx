import Link from "next/link"

import { LogoMark } from "@/components/site/logo"
import { siteConfig } from "@/lib/site"
import { variantHref } from "@/lib/variants"

const href = (path: string) => variantHref("run", path)

/** One line. The page has already said everything it had to. */
export function RunFooter() {
  return (
    <footer className="run-container pt-16 pb-28">
      <div className="flex flex-col gap-5 border-t border-white/[0.08] pt-6 text-[13px] text-[#77777c] md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-2.5">
          <LogoMark className="size-4 text-[#8b8b90]" />
          <span>
            <span className="text-[#c7c7cc]">Join UI</span> — seven components, MIT, by{" "}
            {siteConfig.author}.
          </span>
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href={href("/components")} className="hover:text-[#f5f5f7]">
                Components
              </Link>
            </li>
            <li>
              <Link href={href("/docs")} className="hover:text-[#f5f5f7]">
                Docs
              </Link>
            </li>
            <li>
              <Link href={href("/docs/registry-setup")} className="hover:text-[#f5f5f7]">
                Registry
              </Link>
            </li>
            <li>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-[#f5f5f7]"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
