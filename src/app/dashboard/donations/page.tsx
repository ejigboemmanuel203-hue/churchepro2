import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setGivingDetails } from "@/lib/actions/giving";
import { CopyButton } from "@/components/copy-button";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

type Church = {
  name: string;
  giving_bank_name: string | null;
  giving_account_number: string | null;
  giving_account_name: string | null;
  giving_extra: string | null;
};

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
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

  const isAdmin = profile?.role === "admin";

  const { data: church } = await supabase
    .from("churches")
    .select("name, giving_bank_name, giving_account_number, giving_account_name, giving_extra")
    .eq("id", profile?.church_id ?? "")
    .single<Church>();

  const hasDetails = !!(
    church?.giving_bank_name ||
    church?.giving_account_number ||
    church?.giving_extra
  );

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Donations</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
        <div>
          <h1 className="text-2xl font-bold text-navy">Give to {church?.name}</h1>
          <p className="mt-1 text-steel">
            Support your church&apos;s work. Use the deposit details below.
          </p>
        </div>

        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Giving details saved.
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* Details (everyone) */}
        {hasDetails ? (
          <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            {church?.giving_bank_name && (
              <Row label="Bank" value={church.giving_bank_name} />
            )}
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
          <p className="rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
            {isAdmin
              ? "No giving details yet — add them below so members can give."
              : "Your church hasn't added giving details yet. Please check back soon."}
          </p>
        )}

        {/* Admin edit form */}
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
