/*
 * Runs inline, as the first child of the variant root, before anything in it
 * has painted: reads the stored preference and swaps the root's `.light` for
 * `.dark` when the reader asked for dark (or for "system" on a dark OS). The
 * server always renders `.light`, so a light reader never runs a line of it.
 */
export const THEME_STORAGE_KEY = "joinui-studio-theme"

export const THEME_SCRIPT = `(function(){try{var r=document.currentScript&&document.currentScript.parentElement;if(!r)return;var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){r.classList.remove("light");r.classList.add("dark");r.setAttribute("data-theme","dark")}}catch(e){}})()`
