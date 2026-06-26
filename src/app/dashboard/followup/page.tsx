import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createContact } from "@/lib/actions/followup";
import { CONTACT_TYPES, STATUSES, statusMeta, typeLabel } from "@/lib/followup";

export default async function FollowupListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const { error, status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  const { data: members } = await supabase.from("profiles").select("id, full_name, email");
  const memberName = (id: string | null) =>
    !id ? "—" : members?.find((m) => m.id === id)?.full_name || "Unassigned";

  let query = supabase
    .from("contacts")
    .select("id, full_name, contact_type, status, assigned_to, created_at")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: contacts } = await query;

  const inputClass =
    "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Follow-up</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {/* Add contact (admins only) */}
        {isAdmin && (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h1 className="text-xl font-bold text-navy">Add someone to follow up</h1>
            <form action={createContact} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-deep">Full name *</label>
                <input name="full_name" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Type</label>
                <select name="contact_type" className={inputClass}>
                  {CONTACT_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Phone</label>
                <input name="phone" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Email</label>
                <input name="email" type="email" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">First seen</label>
                <input name="first_seen" type="date" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Assign to</label>
                <select name="assigned_to" className={inputClass} defaultValue="">
                  <option value="">Unassigned</option>
                  {members?.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-deep">Source / notes</label>
                <input name="source" placeholder="e.g. Sunday Service, June 8" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <button className="h-11 rounded-lg bg-sky px-6 font-medium text-white transition-colors hover:bg-deep">
                  Add contact
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filter chips */}
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All" href="/dashboard/followup" active={!status} />
            {STATUSES.map((s) => (
              <FilterChip key={s.key} label={s.label} href={`/dashboard/followup?status=${s.key}`} active={status === s.key} />
            ))}
          </div>

          {!contacts || contacts.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-8 text-center text-steel">
              {status ? "No contacts with this status." : "No contacts yet."}
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {contacts.map((c) => {
                const sm = statusMeta(c.status as string);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/followup/${c.id}`}
                      className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-colors hover:ring-sky"
                    >
                      <div>
                        <p className="font-semibold text-navy">{c.full_name}</p>
                        <p className="text-sm text-steel">
                          {typeLabel(c.contact_type as string)} · Assigned: {memberName(c.assigned_to as string | null)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${sm.badge}`}>{sm.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-sky px-4 py-1.5 text-sm font-medium text-white"
          : "rounded-full border border-steel/30 bg-white px-4 py-1.5 text-sm text-deep hover:border-sky"
      }
    >
      {label}
    </Link>
  );
}
