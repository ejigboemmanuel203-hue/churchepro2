import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Registration = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  custom_data: Record<string, string>;
  created_at: string;
};

export default async function ProgramRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: elev } = await supabase
    .from("profiles")
    .select("elevated")
    .eq("id", user.id)
    .maybeSingle();
  if (!elev?.elevated) redirect("/dashboard/donations");

  const { data: program } = await supabase
    .from("programs")
    .select("title")
    .eq("id", id)
    .single();

  const { data: registrations } = await supabase
    .from("program_registrations")
    .select("id, full_name, phone, email, custom_data, created_at")
    .eq("program_id", id)
    .order("created_at", { ascending: false });

  const { data: fields } = await supabase
    .from("program_custom_fields")
    .select("label")
    .eq("program_id", id)
    .order("sort_order");

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <Link href="/dashboard/donations" className="text-steel hover:text-navy">Programs</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">{program?.title ?? "Registrations"}</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">
          Registrations for {program?.title}
        </h1>
        <p className="mt-1 text-steel">
          {registrations?.length ?? 0} people registered.
        </p>

        {!registrations || registrations.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
            No registrations yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-steel/15 bg-ice/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-deep">#</th>
                  <th className="px-4 py-3 font-medium text-deep">Name</th>
                  <th className="px-4 py-3 font-medium text-deep">Phone</th>
                  <th className="px-4 py-3 font-medium text-deep">Email</th>
                  {(fields ?? []).map((f) => (
                    <th key={f.label} className="px-4 py-3 font-medium text-deep">
                      {f.label as string}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-deep">Date</th>
                </tr>
              </thead>
              <tbody>
                {(registrations as Registration[]).map((r, i) => (
                  <tr key={r.id} className="border-b border-steel/10 last:border-0">
                    <td className="px-4 py-3 text-steel">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-navy">{r.full_name}</td>
                    <td className="px-4 py-3 text-navy">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-navy">{r.email ?? "—"}</td>
                    {(fields ?? []).map((f) => (
                      <td key={f.label} className="px-4 py-3 text-navy">
                        {r.custom_data[f.label as string] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-steel">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
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
