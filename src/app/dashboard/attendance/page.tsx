import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSheet } from "@/lib/actions/attendance";
import { ACTIVITY_TYPES, CATEGORIES, categoryLabel } from "@/lib/attendance";

export default async function AttendanceListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sheets } = await supabase
    .from("attendance_sheets")
    .select("id, title, activity_type, categories, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Attendance</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* Create a new sheet */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-navy">New attendance sheet</h1>
          <p className="mt-1 text-sm text-steel">
            Pick which categories your church tracks. You can add service days afterwards.
          </p>

          <form action={createSheet} className="mt-5 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-deep">Title</label>
                <input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. June Week 1 Services"
                  className="mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                />
              </div>
              <div>
                <label htmlFor="activity_type" className="block text-sm font-medium text-deep">Activity type</label>
                <select
                  id="activity_type"
                  name="activity_type"
                  className="mt-1 w-full rounded-lg border border-steel/40 bg-white px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-deep">Categories to include</span>
              <p className="text-xs text-steel">Untick any your church doesn&apos;t have (that&apos;s the &quot;Nil&quot; — it&apos;s left off the sheet).</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {CATEGORIES.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 rounded-lg border border-steel/30 px-3 py-2 text-sm text-navy">
                    <input type="checkbox" name="categories" value={c.key} defaultChecked className="accent-sky" />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="h-11 self-start rounded-lg bg-sky px-6 font-medium text-white transition-colors hover:bg-deep"
            >
              Create sheet
            </button>
          </form>
        </section>

        {/* Existing sheets */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-navy">Your attendance sheets</h2>
          {!sheets || sheets.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-8 text-center text-steel">
              No sheets yet. Create your first one above.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {sheets.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/attendance/${s.id}`}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-colors hover:ring-sky"
                  >
                    <div>
                      <p className="font-semibold text-navy">{s.title}</p>
                      <p className="text-sm text-steel">
                        {s.activity_type} ·{" "}
                        {(s.categories as string[]).map(categoryLabel).join(", ")}
                      </p>
                    </div>
                    <span className="text-sky">Open →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
