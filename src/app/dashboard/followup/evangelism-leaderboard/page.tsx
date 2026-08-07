import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LeaderRow = {
  user_id: string;
  full_name: string;
  church_name: string;
  total: number;
  won: number;
};

export default async function EvangelismLeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all evangelism entries across the site (RLS will scope to the
  // user's church; to make it site-wide, we use a service-role query or
  // aggregate what's visible). For now, church-scoped is fine — the RLS
  // select policy only returns the user's church rows.
  const { data: entries } = await supabase
    .from("evangelism_entries")
    .select("user_id, won");

  // Aggregate per user.
  const agg: Record<string, { total: number; won: number }> = {};
  for (const e of entries ?? []) {
    const uid = e.user_id as string;
    if (!agg[uid]) agg[uid] = { total: 0, won: 0 };
    agg[uid].total++;
    if (e.won) agg[uid].won++;
  }

  // Enrich with profile names.
  const userIds = Object.keys(agg);
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, churches(name)")
        .in("id", userIds)
    : { data: [] };

  const rows: LeaderRow[] = userIds
    .map((uid) => {
      const p = profiles?.find((pr) => pr.id === uid);
      return {
        user_id: uid,
        full_name: (p?.full_name as string) || "Unknown",
        church_name: ((p?.churches as { name?: string } | null)?.name) ?? "",
        total: agg[uid].total,
        won: agg[uid].won,
      };
    })
    .sort((a, b) => b.won - a.won || b.total - a.total);

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <Link href="/dashboard/followup" className="text-steel hover:text-navy">Follow-up</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Evangelism Leaderboard</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Evangelism Leaderboard</h1>
        <p className="mt-1 text-steel">
          See who&apos;s making the biggest impact reaching people for Christ.
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
            No evangelism entries yet. Start logging encounters!
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-steel/15 bg-ice/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-deep">#</th>
                  <th className="px-4 py-3 font-medium text-deep">Name</th>
                  <th className="px-4 py-3 font-medium text-deep">Church</th>
                  <th className="px-4 py-3 text-center font-medium text-deep">People reached</th>
                  <th className="px-4 py-3 text-center font-medium text-deep">People won</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.user_id} className="border-b border-steel/10 last:border-0">
                    <td className="px-4 py-3 text-steel">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">{r.full_name}</td>
                    <td className="px-4 py-3 text-steel">{r.church_name}</td>
                    <td className="px-4 py-3 text-center text-navy">{r.total}</td>
                    <td className="px-4 py-3 text-center font-semibold text-sky">{r.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
