"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// A slim top progress bar that appears when the user navigates via a link,
// giving instant "page is loading" feedback across the whole site.
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const creep = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setVisible(true);
    setWidth(8);
    if (creep.current) clearInterval(creep.current);
    creep.current = setInterval(() => {
      setWidth((w) => (w < 90 ? w + Math.random() * 12 : w));
    }, 320);
  }

  function finish() {
    if (creep.current) clearInterval(creep.current);
    setWidth(100);
    setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 280);
  }

  // Start the bar when an internal link is clicked.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // When the route actually changes, complete the bar.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent">
      <div
        className="h-full bg-sky shadow-[0_0_8px_var(--color-sky)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
