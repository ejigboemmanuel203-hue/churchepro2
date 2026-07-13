import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDay, deleteDay, deleteSheet } from "@/lib/actions/attendance";
import { SheetEditor } from "./sheet-editor";

export default async function SheetDetailPage({
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

  const { data: sheet } = await supabase
    .from("attendance_sheets")
    .select("id, title, activity_type, categories")
    .eq("id", id)
    .single();

  if (!sheet) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("churches(name)")
    .eq("id", user.id)
    .single();
  const churchName =
    (profile?.churches as { name?: string } | null)?.name ?? "Church";

  const { data: days } = await supabase
    .from("attendance_days")
    .select("id, service_date, day_label, attendance_figures(category, male, female)")
    .eq("sheet_id", id)
    .order("service_date", { ascending: true });

  // Shape the data for the editor: each day -> { category: {male, female} }
  const editorDays = (days ?? []).map((d) => {
    const figures: Record<string, { male: number; female: number }> = {};
    for (const f of (d.attendance_figures as { category: string; male: number; female: number }[]) ?? []) {
      figures[f.category] = { male: f.male, female: f.female };
    }
    return {
      id: d.id,
      service_date: d.service_date as string,
      day_label: (d.day_label as string | null) ?? "",
      figures,
    };
  });

  const categories = sheet.categories as string[];
  const nextDayNumber = editorDays.length + 1;

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <Link href="/dashboard/attendance" className="text-steel hover:text-navy">Church Attendance</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">{sheet.title}</span>
        </div>
        <form action={deleteSheet}>
          <input type="hidden" name="sheet_id" value={sheet.id} />
          <button className="text-sm font-medium text-red-600 hover:text-red-700">Delete sheet</button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">{sheet.title}</h1>
        <p className="mt-1 text-steel">{sheet.activity_type}</p>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* Add a service day */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold text-navy">Add a service day</h2>
          <form action={addDay} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="sheet_id" value={sheet.id} />
            <div>
              <label htmlFor="day_label" className="block text-sm font-medium text-deep">Day label</label>
              <input
                id="day_label"
                name="day_label"
                defaultValue={`Day ${nextDayNumber}`}
                className="mt-1 w-40 rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
              />
            </div>
            <div>
              <label htmlFor="service_date" className="block text-sm font-medium text-deep">Date</label>
              <input
                id="service_date"
                name="service_date"
                type="date"
                required
                className="mt-1 rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-sky px-6 font-medium text-white transition-colors hover:bg-deep"
            >
              + Add day
            </button>
          </form>
        </section>

        {/* The editable grid + live totals */}
        <SheetEditor
          sheetId={sheet.id}
          churchName={churchName}
          title={sheet.title}
          activityType={sheet.activity_type}
          categories={categories}
          days={editorDays}
          deleteDayAction={deleteDay}
        />
      </div>
    </main>
  );
}
