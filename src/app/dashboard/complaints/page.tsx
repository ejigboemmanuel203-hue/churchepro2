import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  submitComplaint,
  markComplaintRead,
  deleteComplaint,
} from "@/lib/actions/complaints";
import {
  COMPLAINT_KINDS,
  COMPLAINT_READER_ROLES,
  kindLabel,
} from "@/lib/complaints";
import type { Complaint } from "@/lib/complaints";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export default async function ComplaintsPage({
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

  const { data: elev } = await supabase
    .from("profiles")
    .select("elevated")
    .eq("id", user.id)
    .maybeSingle();

  const canRead =
    !!elev?.elevated ||
    COMPLAINT_READER_ROLES.includes((profile?.ministry_role as string) ?? "");

  const { data: items } = canRead
    ? await supabase
        .from("complaints")
        .select("id, kind, body, is_read, created_at")
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Complaints & Suggestions</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
        {/* Submit form — every member */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-navy">Share a complaint or suggestion</h1>
          <p className="mt-1 text-sm text-steel">
            Your submission is completely anonymous — your name is never recorded.
            Only admins and pastors will see it.
          </p>

          {sent && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Your message has been submitted. Thank you for helping make things better.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <form action={submitComplaint} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-deep">Type</label>
              <select name="kind" defaultValue="suggestion" className={inputClass}>
                {COMPLAINT_KINDS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep">Your message</label>
              <textarea
                name="body"
                required
                rows={4}
                placeholder="Share your complaint or suggestion…"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep"
            >
              Submit anonymously
            </button>
          </form>
        </section>

        {/* Inbox — admins & pastors only */}
        {canRead && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-navy">
              Inbox
              {items && items.length > 0 && (
                <span className="ml-2 rounded-full bg-sky px-2 py-0.5 text-xs font-medium text-white align-middle">
                  {items.filter((r) => !r.is_read).length} new
                </span>
              )}
            </h2>

            {!items || items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
                No complaints or suggestions yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {(items as Complaint[]).map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                      r.is_read ? "ring-black/5" : "ring-sky"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        r.kind === "complaint"
                          ? "bg-red-50 text-red-700"
                          : "bg-ice text-deep"
                      }`}>
                        {kindLabel(r.kind)}
                      </span>
                      <span className="text-xs text-steel">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-navy">{r.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      {!r.is_read && (
                        <form action={markComplaintRead}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="text-sm font-medium text-sky hover:text-deep">
                            Mark as read
                          </button>
                        </form>
                      )}
                      <form action={deleteComplaint}>
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
