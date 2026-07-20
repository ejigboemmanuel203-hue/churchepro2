"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AssistantChat } from "@/app/dashboard/assistant/assistant-chat";

// Floating action button (bottom-right) that opens the AI assistant in a
// floating chat panel — similar to the Meta AI button in WhatsApp.
export function AssistantFab() {
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(true);

  // Only draw attention for the first few seconds, then stop pulsing.
  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-3 top-16 bottom-28 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 md:inset-auto md:right-6 md:bottom-24 md:h-[70vh] md:max-h-[560px] md:w-96">
          <div className="flex items-center justify-between bg-gradient-to-br from-deep to-sky px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
                <Image src="/ai-chatbot.png" alt="" width={20} height={20} className="h-4 w-4" />
              </span>
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
      <div className="fixed right-4 bottom-20 z-50 md:right-6 md:bottom-6">
        {/* subtle attention pulse (first few seconds only, when closed) */}
        {!open && pulsing && (
          <span className="absolute inset-0 -z-10 rounded-full bg-sky/40 animate-fab-pulse" />
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close assistant" : "Open assistant"}
          className="flex items-center gap-2 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 md:pr-4"
        >
          {open ? (
            <span className="flex h-9 w-9 items-center justify-center text-2xl leading-none text-deep">
              ×
            </span>
          ) : (
            <>
              <Image src="/ai-chatbot.png" alt="" width={40} height={40} className="h-9 w-9" />
              <span className="hidden pr-1 font-semibold text-deep md:inline">
                Ask AI
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
