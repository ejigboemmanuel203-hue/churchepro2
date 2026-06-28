import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  submitPrayerRequest,
  markPrayerRead,
  deletePrayerRequest,
} from "@/lib/actions/prayer";
import {
  PRAYER_CATEGORIES,
  PRAYER_TEAM_ROLES,
  categoryLabel,
} from "@/lib/prayer";
import type { PrayerRequest } from "@/lib/prayer";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export default async function PrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ministry_role")
    .eq("id", user.id)
    .single();

  const isPrayerTeam = PRAYER_TEAM_ROLES.includes(
    (profile?.ministry_role as string) ?? "",
  );

  // Only the prayer team can read requests (RLS also enforces this).
  const { data: requests } = isPrayerTeam
    ? await supabase
        .from("prayer_requests")
        .select("id, category, body, is_read, created_at")
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Prayer Requests</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
        {/* Submit form — open to every member */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-navy">Submit a prayer request</h1>
          <p className="mt-1 text-sm text-steel">
            Your request is completely anonymous — your name is never recorded.
            Only the prayer team will see it.
          </p>

          {sent && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              🙏 Your prayer request has been received. Be encouraged — the prayer
              team is praying with you.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <form action={submitPrayerRequest} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-deep">Category</label>
              <select name="category" defaultValue="general" className={inputClass}>
                {PRAYER_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep">Your request</label>
              <textarea
                name="body"
                required
                rows={4}
                placeholder="Share what you'd like the prayer team to pray about…"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep"
            >
              Send anonymously
            </button>
          </form>
        </section>

        {/* Inbox — prayer team only */}
        {isPrayerTeam && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-navy">
              Prayer inbox
              {requests && requests.length > 0 && (
                <span className="ml-2 rounded-full bg-sky px-2 py-0.5 text-xs font-medium text-white align-middle">
                  {requests.filter((r) => !r.is_read).length} new
                </span>
              )}
            </h2>

            {!requests || requests.length === 0 ? (
              <p className="rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
                No prayer requests yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {(requests as PrayerRequest[]).map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                      r.is_read ? "ring-black/5" : "ring-sky"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-ice px-3 py-1 text-xs font-medium text-deep">
                        {categoryLabel(r.category)}
                      </span>
                      <span className="text-xs text-steel">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-navy">{r.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      {!r.is_read && (
                        <form action={markPrayerRead}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="text-sm font-medium text-sky hover:text-deep">
                            Mark as prayed
                          </button>
                        </form>
                      )}
                      <form action={deletePrayerRequest}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="text-sm font-medium text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
