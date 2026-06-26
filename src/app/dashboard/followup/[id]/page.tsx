import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addLog, assignContact, deleteContact, deleteLog, updateContactStatus } from "@/lib/actions/followup";
import { METHODS, STATUSES, methodLabel, statusMeta, typeLabel } from "@/lib/followup";

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();
  if (!contact) notFound();

  const { data: members } = await supabase.from("profiles").select("id, full_name, email");
  const memberName = (uid: string | null) =>
    !uid ? "Unassigned" : members?.find((m) => m.id === uid)?.full_name || "Unknown";

  const { data: logs } = await supabase
    .from("followup_logs")
    .select("id, note, method, logged_by, created_at")
    .eq("contact_id", id)
    .order("created_at", { ascending: false });

  const sm = statusMeta(contact.status as string);
  const inputClass =
    "rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <Link href="/dashboard/followup" className="text-steel hover:text-navy">Follow-up</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">{contact.full_name}</span>
        </div>
        {isAdmin && (
          <form action={deleteContact}>
            <input type="hidden" name="contact_id" value={contact.id} />
            <button className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
          </form>
        )}
      </header>

      <div className="mx-auto grid w-full max-w-4xl gap-6 px-6 py-10 lg:grid-cols-3">
        {error && <p className="lg:col-span-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {/* Contact info + admin controls */}
        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-navy">{contact.full_name}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${sm.badge}`}>{sm.label}</span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Type" value={typeLabel(contact.contact_type as string)} />
              <Row label="Phone" value={(contact.phone as string) || "—"} />
              <Row label="Email" value={(contact.email as string) || "—"} />
              <Row label="Source" value={(contact.source as string) || "—"} />
              <Row label="First seen" value={(contact.first_seen as string) || "—"} />
              <Row label="Assigned to" value={memberName(contact.assigned_to as string | null)} />
            </dl>
            {contact.notes && (
              <p className="mt-4 rounded-lg bg-ice p-3 text-sm text-navy">{contact.notes as string}</p>
            )}
          </div>

          {isAdmin && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="font-bold text-navy">Manage</h2>
              <form action={updateContactStatus} className="mt-4 flex items-end gap-2">
                <input type="hidden" name="contact_id" value={contact.id} />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-deep">Status</label>
                  <select name="status" defaultValue={contact.status as string} className={`mt-1 w-full ${inputClass}`}>
                    {STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <button className="h-10 rounded-lg bg-sky px-4 text-sm font-medium text-white hover:bg-deep">Save</button>
              </form>
              <form action={assignContact} className="mt-4 flex items-end gap-2">
                <input type="hidden" name="contact_id" value={contact.id} />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-deep">Assign to</label>
                  <select name="assigned_to" defaultValue={(contact.assigned_to as string) || ""} className={`mt-1 w-full ${inputClass}`}>
                    <option value="">Unassigned</option>
                    {members?.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                    ))}
                  </select>
                </div>
                <button className="h-10 rounded-lg bg-sky px-4 text-sm font-medium text-white hover:bg-deep">Save</button>
              </form>
            </div>
          )}
        </section>

        {/* Follow-up timeline */}
        <section className="lg:col-span-2 space-y-6">
          {isAdmin && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="font-bold text-navy">Log a follow-up</h2>
              <form action={addLog} className="mt-4 space-y-3">
                <input type="hidden" name="contact_id" value={contact.id} />
                <div className="flex gap-2">
                  <select name="method" className={inputClass}>
                    {METHODS.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  name="note"
                  required
                  rows={3}
                  placeholder="What happened? e.g. Called, will visit on Saturday."
                  className={`w-full ${inputClass}`}
                />
                <button className="rounded-lg bg-sky px-5 py-2 text-sm font-semibold text-white hover:bg-deep">Add log</button>
              </form>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-navy">Follow-up history</h2>
            {!logs || logs.length === 0 ? (
              <p className="mt-3 text-sm text-steel">No follow-ups logged yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {logs.map((l) => (
                  <li key={l.id} className="border-l-2 border-sky pl-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-deep">{methodLabel(l.method as string)}</span>
                      <span className="text-xs text-steel">
                        {new Date(l.created_at as string).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-navy">{l.note as string}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-steel">by {memberName(l.logged_by as string | null)}</span>
                      {isAdmin && (
                        <form action={deleteLog}>
                          <input type="hidden" name="log_id" value={l.id} />
                          <input type="hidden" name="contact_id" value={contact.id} />
                          <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-steel">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}
