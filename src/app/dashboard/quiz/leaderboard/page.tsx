import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Row = { id: string; full_name: string | null; quiz_points: number };

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("church_id")
    .eq("id", user.id)
    .single();

  const { data: rows } = await supabase
    .from("profiles")
    .select("id, full_name, quiz_points")
    .eq("church_id", me?.church_id ?? "")
    .gt("quiz_points", 0)
    .order("quiz_points", { ascending: false })
    .limit(100);

  const players = (rows ?? []) as Row[];

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <Link href="/dashboard/quiz" className="text-steel hover:text-navy">Bible Quiz</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Leaderboard</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Quiz Leaderboard</h1>
        <p className="mt-1 text-steel">
          Top members by total correct answers.
        </p>

        {players.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
            No scores yet. Take a quiz to get on the board!
          </p>
        ) : (
          <ol className="mt-6 space-y-2">
            {players.map((p, i) => {
              const isMe = p.id === user.id;
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 shadow-sm ring-1 ${
                    isMe ? "bg-sky/10 ring-sky" : "bg-white ring-black/5"
                  }`}
                >
                  <span className="w-8 shrink-0 text-center text-lg font-bold text-deep">
                    {MEDAL[i] ?? i + 1}
                  </span>
                  <span className="flex-1 truncate font-medium text-navy">
                    {p.full_name || "Member"}
                    {isMe && <span className="ml-2 text-xs font-normal text-sky">(you)</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-deep">
                    {p.quiz_points}
                    <span className="ml-1 text-xs font-normal text-steel">pts</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8">
          <Link
            href="/dashboard/quiz"
            className="inline-block rounded-lg bg-sky px-6 py-2.5 font-semibold text-white transition-colors hover:bg-deep"
          >
            Take a quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
