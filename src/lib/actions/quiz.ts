"use server";

import { createClient } from "@/lib/supabase/server";

// Adds the number of correct answers from a finished quiz to the member's
// cumulative leaderboard total. Called once when a quiz reaches results.
export async function recordQuizResult(correct: number) {
  const safe = Math.max(0, Math.floor(Number(correct) || 0));
  if (safe === 0) return { ok: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("quiz_points")
    .eq("id", user.id)
    .single();

  const current = (profile?.quiz_points as number) ?? 0;
  await supabase
    .from("profiles")
    .update({ quiz_points: current + safe })
    .eq("id", user.id);

  return { ok: true };
}
