/**
 * Copies text to the clipboard.
 *
 * The async Clipboard API is unavailable outside secure contexts (plain-HTTP
 * previews, some in-app browsers), so this falls back to a hidden textarea and
 * `execCommand`. Throws on failure so callers can surface a real error state
 * instead of silently pretending the copy worked.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Permission denied or non-secure context — fall through.
    }
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is unavailable in this environment.")
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.setAttribute("aria-hidden", "true")
  textarea.style.position = "fixed"
  textarea.style.top = "-1000px"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)

  try {
    textarea.select()
    const succeeded = document.execCommand("copy")
    if (!succeeded) throw new Error("Copy command was rejected.")
  } finally {
    document.body.removeChild(textarea)
  }
}
