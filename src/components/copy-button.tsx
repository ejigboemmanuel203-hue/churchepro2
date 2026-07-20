"use client";

import { useState } from "react";

// Small "Copy" button for a piece of text (e.g. an account number).
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="shrink-0 rounded-lg bg-sky px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-deep"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
