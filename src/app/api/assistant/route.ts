import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_BIBLE_DOMAINS,
  ASSISTANT_MODEL,
  DAILY_MESSAGE_LIMIT,
  MAX_TOKENS,
  SYSTEM_PROMPT,
} from "@/lib/assistant";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  // ---- validate input ----
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-12); // keep the last few turns

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No message to answer." }, { status: 400 });
  }

  // ---- per-user daily rate limit ----
  const today = new Date().toISOString().slice(0, 10);
  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_day, ai_count")
    .eq("id", user.id)
    .single();

  const usedToday = profile?.ai_day === today ? (profile?.ai_count ?? 0) : 0;
  if (usedToday >= DAILY_MESSAGE_LIMIT) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_MESSAGE_LIMIT} messages. Please come back tomorrow.` },
      { status: 429 },
    );
  }

  // ---- call Claude ----
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The assistant isn't set up yet. Please try again later." },
      { status: 503 },
    );
  }

  let reply = "";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ASSISTANT_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            allowed_domains: ALLOWED_BIBLE_DOMAINS,
            max_uses: 3,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "The assistant is unavailable right now. Please try again shortly." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    reply = (data.content ?? [])
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("")
      .trim();

    if (!reply) reply = "Sorry, I couldn't come up with a reply. Please try rephrasing.";
  } catch {
    return NextResponse.json(
      { error: "Something went wrong reaching the assistant." },
      { status: 502 },
    );
  }

  // ---- record usage (only on success) ----
  await supabase
    .from("profiles")
    .update({ ai_day: today, ai_count: usedToday + 1 })
    .eq("id", user.id);

  return NextResponse.json({
    reply,
    remaining: DAILY_MESSAGE_LIMIT - (usedToday + 1),
  });
}
