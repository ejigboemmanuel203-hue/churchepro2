"use client";

import { useState } from "react";
import { AssistantChat } from "@/app/dashboard/assistant/assistant-chat";

// Floating action button (bottom-right) that opens the AI assistant in a
// floating chat panel — similar to the Meta AI button in WhatsApp.
export function AssistantFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-3 top-16 bottom-28 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 md:inset-auto md:right-6 md:bottom-24 md:h-[70vh] md:max-h-[560px] md:w-96">
          <div className="flex items-center justify-between bg-gradient-to-br from-deep to-sky px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkle className="h-5 w-5" />
              <span className="font-semibold">Churchepro Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-2xl leading-none text-white/90 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <AssistantChat />
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-deep to-sky text-white shadow-lg ring-1 ring-white/20 transition-transform hover:scale-105 md:right-6 md:bottom-6"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <Sparkle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3Z" />
      <path d="M18 14l.9 2.1 2.1.9-2.1.9L18 20l-.9-2.1-2.1-.9 2.1-.9L18 14Z" />
    </svg>
  );
}
