"use client";

/*
 * Runs in <head> before the first paint, so the page never flashes the wrong
 * theme: a saved choice (localStorage "hr-theme") wins, otherwise the device
 * setting. Also adds the `js` class that lets scroll-reveal content start hidden.
 * The <html> element needs suppressHydrationWarning (this changes it before React loads).
 */
export const THEME_STORAGE_KEY = "hr-theme";

const script = `(function(){var d=document.documentElement;d.classList.add("js");var t;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t)})()`;

/*
 * On the server it's a normal script; when React renders on the client it
 * becomes inert text/plain (it already ran), which also avoids React's
 * "script tag" warning. suppressHydrationWarning covers the type difference.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
