"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How do I record attendance?",
  "What does John 3:16 mean?",
  "How do I upload a sermon?",
  "Explain the parable of the sower.",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError(null);
    setInput("");

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
      );
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-deep to-sky text-2xl text-white shadow-sm">
              ✨
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-navy">
              Ask the Churchepro Assistant
            </h2>
            <p className="mt-1 max-w-sm text-sm text-steel">
              I can help you use Churchepro or answer Bible questions.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-steel/30 bg-white px-3 py-1.5 text-sm text-deep transition-colors hover:border-sky hover:text-sky"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-sky text-white"
                    : "bg-ice text-navy"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}

        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-ice px-4 py-2.5 text-sm text-steel">Thinking…</div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask about Churchepro or the Bible…"
          className="max-h-32 flex-1 resize-none rounded-xl border border-steel/40 px-4 py-3 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-12 shrink-0 rounded-xl bg-sky px-5 font-semibold text-white transition-colors hover:bg-deep disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <p className="mt-2 text-center text-xs text-steel">
        The assistant can make mistakes and isn&apos;t a doctrinal authority.
        For serious matters, please talk to your pastor. Limited to 10 messages
        a day.
      </p>
    </div>
  );
}
