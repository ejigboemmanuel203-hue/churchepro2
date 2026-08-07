import { createClient } from "@/lib/supabase/server";
import { PublicRegistrationForm } from "./registration-form";

type Program = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  is_open: boolean;
  church_id: string;
};

type CustomField = {
  id: string;
  label: string;
  field_type: "text" | "number" | "select";
  options: string[] | null;
  required: boolean;
};

type Church = {
  name: string;
  giving_bank_name: string | null;
  giving_account_number: string | null;
  giving_account_name: string | null;
  giving_extra: string | null;
};

export default async function PublicRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, title, description, date, location, is_open, church_id")
    .eq("id", id)
    .single<Program>();

  if (!program) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ice px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-navy">Program not found</h1>
          <p className="mt-2 text-steel">This link may be expired or invalid.</p>
        </div>
      </main>
    );
  }

  if (!program.is_open) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ice px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-navy">Registration closed</h1>
          <p className="mt-2 text-steel">
            Registration for <strong>{program.title}</strong> is currently closed.
          </p>
        </div>
      </main>
    );
  }

  const { data: fields } = await supabase
    .from("program_custom_fields")
    .select("id, label, field_type, options, required")
    .eq("program_id", id)
    .order("sort_order");

  const { data: church } = await supabase
    .from("churches")
    .select("name, giving_bank_name, giving_account_number, giving_account_name, giving_extra")
    .eq("id", program.church_id)
    .single<Church>();

  const hasGiving = !!(
    church?.giving_bank_name ||
    church?.giving_account_number ||
    church?.giving_extra
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-ice px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <p className="text-sm font-medium text-sky">{church?.name}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy">{program.title}</h1>
          {program.description && (
            <p className="mt-2 text-steel">{program.description}</p>
          )}
          <p className="mt-1 text-xs text-steel">
            {program.date && `Date: ${program.date}`}
            {program.date && program.location && " · "}
            {program.location && `Location: ${program.location}`}
          </p>
        </div>

        <PublicRegistrationForm
          programId={program.id}
          churchId={program.church_id}
          customFields={(fields as CustomField[]) ?? []}
        />

        {/* Giving details */}
        {hasGiving && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-navy">Support {church?.name}</h2>
            <p className="mt-1 text-sm text-steel">Use the details below to give.</p>
            <div className="mt-4 space-y-2 text-sm">
              {church?.giving_bank_name && (
                <p><span className="text-steel">Bank:</span> <span className="font-medium text-navy">{church.giving_bank_name}</span></p>
              )}
              {church?.giving_account_number && (
                <p><span className="text-steel">Account:</span> <span className="font-semibold tracking-wide text-navy">{church.giving_account_number}</span></p>
              )}
              {church?.giving_account_name && (
                <p><span className="text-steel">Name:</span> <span className="font-medium text-navy">{church.giving_account_name}</span></p>
              )}
              {church?.giving_extra && (
                <div>
                  <p className="text-steel">Other ways to give:</p>
                  <p className="mt-1 whitespace-pre-wrap text-navy">{church.giving_extra}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-steel">
          Powered by <span className="font-semibold text-navy">Church<span className="text-sky">epro</span></span>
        </p>
      </div>
    </main>
  );
}
