/** Generates the public SVG and app icons from the shared Join UI geometry. */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

import { MARK } from "@/lib/brand"

const projectRoot = process.cwd()
const paths = MARK.paths.map((d) => `<path d="${d}"/>`).join("")

function svg(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}" width="512" height="512">${content}</svg>\n`
}

async function icon(size: number, scale: number): Promise<Buffer> {
  const inset = (24 - 24 * scale) / 2
  const source = svg(
    `<rect width="24" height="24" fill="#050506"/><g fill="#ffffff" transform="translate(${inset} ${inset}) scale(${scale})">${paths}</g>`
  )

  return sharp(Buffer.from(source)).resize(size, size).png().toBuffer()
}

/** ICO directory containing a PNG image for each native browser-tab size. */
function ico(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length

  images.forEach(({ size, png }, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(size, entry)
    header.writeUInt8(size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })

  return Buffer.concat([header, ...images.map(({ png }) => png)])
}

async function main(): Promise<void> {
  const brandDirectory = path.join(projectRoot, "public", "brand")
  await mkdir(brandDirectory, { recursive: true })

  // The launcher mark fits within the central 80% safe circle. Favicons use
  // more of their canvas to keep both modules legible at 16 CSS pixels.
  const launcher = await icon(512, 2 / 3)
  const apple = await icon(180, 0.78)
  const favicon = ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, png: await icon(size, 1) }))
    )
  )

  await writeFile(
    path.join(brandDirectory, "join-ui-mark.svg"),
    svg(`<title>Join UI</title><g fill="currentColor">${paths}</g>`)
  )
  await writeFile(path.join(projectRoot, "app", "icon.png"), launcher)
  await writeFile(path.join(projectRoot, "app", "apple-icon.png"), apple)
  await writeFile(path.join(projectRoot, "app", "favicon.ico"), favicon)

  console.log("✓ Join UI brand built — SVG, 512px app icon, 180px Apple icon, 16/32/48px favicon")
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
