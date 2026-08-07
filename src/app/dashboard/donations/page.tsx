import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setGivingDetails } from "@/lib/actions/giving";
import { toggleProgramOpen, deleteProgram } from "@/lib/actions/programs";
import { CopyButton } from "@/components/copy-button";
import { CreateProgramForm } from "./create-program-form";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

type Church = {
  id: string;
  name: string;
  giving_bank_name: string | null;
  giving_account_number: string | null;
  giving_account_name: string | null;
  giving_extra: string | null;
};

type Program = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  is_open: boolean;
  created_at: string;
};

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  const { error, saved, created } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id, role")
    .eq("id", user.id)
    .single();

  const { data: elev } = await supabase
    .from("profiles")
    .select("elevated")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin" && !!elev?.elevated;

  const { data: church } = await supabase
    .from("churches")
    .select("id, name, giving_bank_name, giving_account_number, giving_account_name, giving_extra")
    .eq("id", profile?.church_id ?? "")
    .single<Church>();

  const hasDetails = !!(
    church?.giving_bank_name ||
    church?.giving_account_number ||
    church?.giving_extra
  );

  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, description, date, location, is_open, created_at")
    .eq("church_id", profile?.church_id ?? "")
    .order("created_at", { ascending: false });

  // Registration counts per program (admin only).
  let regCounts: Record<string, number> = {};
  if (isAdmin && programs && programs.length > 0) {
    const { data: regs } = await supabase
      .from("program_registrations")
      .select("program_id")
      .in("program_id", programs.map((p) => p.id));
    if (regs) {
      for (const r of regs) {
        regCounts[r.program_id as string] = (regCounts[r.program_id as string] ?? 0) + 1;
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://churchepro.vercel.app";

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Programs & Donations</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-bold text-navy">Programs & Donations</h1>
          <p className="mt-1 text-steel">
            Register for programs and support {church?.name}.
          </p>
        </div>

        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Giving details saved.
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Program created successfully.
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* ---- Programs ---- */}
        <section>
          <h2 className="text-lg font-bold text-navy">Programs</h2>

          {isAdmin && church && <CreateProgramForm />}

          {!programs || programs.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
              No programs yet.{isAdmin ? " Create the first one above." : ""}
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {(programs as Program[]).map((p) => {
                const shareUrl = `${siteUrl}/register/${p.id}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                  `Register for ${p.title} at ${church?.name}: ${shareUrl}`
                )}`;
                return (
                  <li key={p.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-navy">{p.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {p.is_open ? "Open" : "Closed"}
                          </span>
                        </div>
                        {p.description && <p className="mt-1 text-sm text-steel">{p.description}</p>}
                        <p className="mt-1 text-xs text-steel">
                          {p.date && `Date: ${p.date}`}
                          {p.date && p.location && " · "}
                          {p.location && `Location: ${p.location}`}
                        </p>
                        {isAdmin && (
                          <p className="mt-1 text-xs font-medium text-deep">
                            {regCounts[p.id] ?? 0} registration(s)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.is_open && (
                        <>
                          <Link
                            href={`/register/${p.id}`}
                            className="rounded-lg bg-sky px-3 py-1.5 text-sm font-medium text-white hover:bg-deep"
                          >
                            Register
                          </Link>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                          >
                            Share on WhatsApp
                          </a>
                          <CopyButton text={shareUrl} label="Copy link" />
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <form action={toggleProgramOpen} className="inline">
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="is_open" value={String(p.is_open)} />
                            <button className="text-sm font-medium text-steel hover:text-navy">
                              {p.is_open ? "Close registration" : "Reopen"}
                            </button>
                          </form>
                          <form action={deleteProgram} className="inline">
                            <input type="hidden" name="id" value={p.id} />
                            <button className="text-sm font-medium text-red-600 hover:text-red-700">
                              Delete
                            </button>
                          </form>
                          <Link
                            href={`/dashboard/donations/${p.id}`}
                            className="text-sm font-medium text-sky hover:text-deep"
                          >
                            View registrations
                          </Link>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---- Giving details ---- */}
        <section>
          <h2 className="text-lg font-bold text-navy">Giving / Donation Details</h2>
          <p className="mt-1 text-sm text-steel">
            Support your church using the deposit details below.
          </p>

          {hasDetails ? (
            <div className="mt-4 space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              {church?.giving_bank_name && <Row label="Bank" value={church.giving_bank_name} />}
              {church?.giving_account_number && (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-steel">Account number</p>
                    <p className="font-semibold tracking-wide text-navy">
                      {church.giving_account_number}
                    </p>
                  </div>
                  <CopyButton text={church.giving_account_number} />
                </div>
              )}
              {church?.giving_account_name && (
                <Row label="Account name" value={church.giving_account_name} />
              )}
              {church?.giving_extra && (
                <div>
                  <p className="text-sm text-steel">Other ways to give</p>
                  <p className="mt-1 whitespace-pre-wrap text-navy">{church.giving_extra}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
              {isAdmin
                ? "No giving details yet — add them below so members can give."
                : "Your church hasn't added giving details yet. Please check back soon."}
            </p>
          )}
        </section>

        {/* Admin: edit giving details */}
        {isAdmin && (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-navy">
              {hasDetails ? "Edit giving details" : "Add giving details"}
            </h2>
            <p className="mt-1 text-sm text-steel">
              Only you (the church admin) can edit this. Members see it read-only.
            </p>
            <form action={setGivingDetails} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep">Bank name</label>
                <input name="bank_name" defaultValue={church?.giving_bank_name ?? ""} className={inputClass} placeholder="e.g. First Bank" />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Account number</label>
                <input name="account_number" defaultValue={church?.giving_account_number ?? ""} className={inputClass} placeholder="e.g. 0123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Account name</label>
                <input name="account_name" defaultValue={church?.giving_account_name ?? ""} className={inputClass} placeholder="e.g. Grace Community Church" />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep">Other ways to give (optional)</label>
                <textarea name="extra" rows={3} defaultValue={church?.giving_extra ?? ""} className={inputClass} placeholder="Mobile money, USSD, in-person, etc." />
              </div>
              <button className="h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep">
                Save details
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-steel">{label}</p>
      <p className="font-semibold text-navy">{value}</p>
    </div>
  );
}
