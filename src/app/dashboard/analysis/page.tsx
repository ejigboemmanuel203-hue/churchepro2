import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id, elevated")
    .eq("id", user.id)
    .single();

  if (!profile?.elevated) redirect("/dashboard");

  const churchId = profile.church_id as string;

  // Active users (profiles with this church_id)
  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("church_id", churchId);

  // Total attendance records
  const { count: totalAttendance } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("church_id", churchId);

  // Programs
  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, is_open")
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });

  // Registration counts per program
  const programIds = programs?.map((p) => p.id) ?? [];
  const { data: regs } = programIds.length > 0
    ? await supabase
        .from("program_registrations")
        .select("program_id")
        .in("program_id", programIds)
    : { data: [] };

  const regCounts: Record<string, number> = {};
  for (const r of regs ?? []) {
    const pid = r.program_id as string;
    regCounts[pid] = (regCounts[pid] ?? 0) + 1;
  }

  // Evangelism totals
  const { data: evangEntries } = await supabase
    .from("evangelism_entries")
    .select("won")
    .eq("church_id", churchId);
  const evangTotal = evangEntries?.length ?? 0;
  const evangWon = evangEntries?.filter((e) => e.won).length ?? 0;

  // Complaints unread
  const { count: unreadComplaints } = await supabase
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("church_id", churchId)
    .eq("is_read", false);

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Analysis</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Church Analytics</h1>
        <p className="mt-1 text-steel">Overview of your church&apos;s activity.</p>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active members" value={activeUsers ?? 0} />
          <StatCard label="Attendance records" value={totalAttendance ?? 0} />
          <StatCard label="People reached" value={evangTotal} accent />
          <StatCard label="People won" value={evangWon} accent />
        </div>

        {/* Complaints */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-navy">Unread complaints & suggestions</h2>
          <p className="mt-1 text-3xl font-bold text-navy">{unreadComplaints ?? 0}</p>
          <Link href="/dashboard/complaints" className="mt-2 inline-block text-sm font-medium text-sky hover:text-deep">
            View inbox →
          </Link>
        </div>

        {/* Programs */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-navy">Program registrations</h2>
          {!programs || programs.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-8 text-center text-steel">
              No programs created yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-steel/15 bg-ice/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-deep">Program</th>
                    <th className="px-4 py-3 text-center font-medium text-deep">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-deep">Registrations</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.id} className="border-b border-steel/10 last:border-0">
                      <td className="px-4 py-3 font-medium text-navy">{p.title}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                          {p.is_open ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-navy">
                        {regCounts[p.id] ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-black/5">
      <p className={`text-3xl font-bold ${accent ? "text-sky" : "text-navy"}`}>{value}</p>
      <p className="mt-1 text-sm text-steel">{label}</p>
    </div>
  );
}
