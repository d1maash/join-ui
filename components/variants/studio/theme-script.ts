/*
 * Runs inline, at the top of the variant root, before anything in it has
 * painted: reads the stored preference and swaps the root's `.light` for
 * `.dark` when the reader asked for dark (or for "system" on a dark OS). The
 * server always renders `.light`, so a light reader never runs a line of it.
 */
export const THEME_STORAGE_KEY = "joinui-studio-theme"

export const THEME_SCRIPT = `(function(){try{var s=document.currentScript,r=s&&s.closest("[data-studio-root]");if(!r)return;var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){r.classList.remove("light");r.classList.add("dark");r.setAttribute("data-theme","dark")}}catch(e){}})()`

/*
 * Shipped inside a wrapper's innerHTML rather than as a React <script>: the
 * browser runs it when it parses the server HTML, and a client-side render
 * (a navigation into the variant, a dev-mode not-found) inserts it inert
 * without React warning about a script it cannot execute — ThemeSync covers
 * that case.
 */
export const THEME_SCRIPT_HTML = `<script>${THEME_SCRIPT}</script>`
