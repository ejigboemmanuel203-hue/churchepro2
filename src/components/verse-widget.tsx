"use client";

import { useEffect, useState } from "react";
import { MEMORY_VERSES } from "@/lib/memory-verses";

// Rotating Bible memory verse — changes every 8 seconds with a soft fade.
export function VerseWidget() {
  // Start at a fixed verse so server and client render the same HTML
  // (avoids hydration mismatch); randomise once mounted on the client.
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * MEMORY_VERSES.length));
    const id = setInterval(() => {
      setVisible(false);
      // fade out, swap, fade back in
      setTimeout(() => {
        setIndex((i) => (i + 1) % MEMORY_VERSES.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const verse = MEMORY_VERSES[index];

  return (
    <div className="w-full shrink-0 rounded-2xl bg-gradient-to-br from-deep to-sky p-5 text-white shadow-sm md:w-80">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        Memory verse
      </p>
      <div
        className={`transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="mt-2 text-sm leading-relaxed">&ldquo;{verse.text}&rdquo;</p>
        <p className="mt-2 text-sm font-semibold text-ice">— {verse.ref}</p>
      </div>
    </div>
  );
}
