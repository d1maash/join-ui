import type { GlassCrestMark } from "@/registry/components/glass-crest"

/*
 * The marks are inline SVG rather than an icon set, which is the point: a crest
 * is a row of brands, and an icon library never has the ones you need. They are
 * drawn as solid shapes because the disc prints each glyph twice — once blurred
 * underneath to give it thickness — and a hairline stroke has nothing to cast.
 *
 * Nothing here is a real trademark; they are the shapes a token drawer reaches
 * for, in the palette the reference section used, left to right.
 */
export const MARKS: GlassCrestMark[] = [
  {
    id: "prism",
    label: "Prism",
    accent: "#2f7a63",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.5 19.2 12 12 16.2 4.8 12z" />
        <path d="M12 17.7 19.2 13.5 12 22.5 4.8 13.5z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "tessera",
    label: "Tessera",
    accent: "#d5d8d2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 3h16v3.6h-6.1V21h-3.8V6.6H4z" />
        <path d="M6.6 9.4h10.8V13H6.6z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "obol",
    label: "Obol",
    accent: "#dda15e",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 1.5h2.3v3H10zM13.7 1.5H16v3h-2.3zM10 19.5h2.3v3H10zM13.7 19.5H16v3h-2.3z" />
        <path d="M6.4 4h7.2c2.9 0 4.7 1.4 4.7 3.7 0 1.5-.8 2.6-2.1 3.2 1.7.5 2.8 1.8 2.8 3.6 0 2.6-2 4.5-5.2 4.5H6.4zm3.6 3v3.1h3.1c1.1 0 1.8-.6 1.8-1.6S14.2 7 13.1 7zm0 5.8V16h3.5c1.2 0 2-.6 2-1.6s-.8-1.6-2-1.6z" />
      </svg>
    ),
  },
  {
    id: "helix",
    label: "Helix",
    accent: "#5cc396",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.6 20.6 6.8v10.4L12 22.4 3.4 17.2V6.8z" />
        <path d="M12 6.4 16.6 9.2v5.6L12 17.6 7.4 14.8V9.2z" opacity={0.55} />
      </svg>
    ),
  },
  {
    id: "cadence",
    label: "Cadence",
    accent: "#a6bfd2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3.6 3.4h4.1L12 8.1l4.3-4.7h4.1L14 10.5a2.8 2.8 0 0 1-4 0z" />
        <path d="M3.6 20.6h4.1L12 15.9l4.3 4.7h4.1L14 13.5a2.8 2.8 0 0 0-4 0z" opacity={0.72} />
      </svg>
    ),
  },
  {
    id: "sterling",
    label: "Sterling",
    accent: "#bcc1c7",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.4 2.4h4.2l-2.4 8.9 5.3-1.6-.8 3-5.3 1.6-1 3.8h9v3.5H4.6l1.9-7.1-2.6.8.8-3 2.6-.8z" />
      </svg>
    ),
  },
  {
    id: "azimuth",
    label: "Azimuth",
    accent: "#8fa2ee",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.6 4.6h13.8l-3.4 3.6H3.2z" />
        <path d="M3.2 10.2h13.8l3.4 3.6H6.6z" opacity={0.72} />
        <path d="M6.6 15.8h13.8l-3.4 3.6H3.2z" opacity={0.5} />
      </svg>
    ),
  },
]
