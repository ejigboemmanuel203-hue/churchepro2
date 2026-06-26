"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper: get the current user + their church id (or bounce to login/dashboard).
async function requireChurch(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id")
    .eq("id", user.id)
    .single();

  if (!profile?.church_id) redirect("/dashboard");
  return { user, churchId: profile.church_id as string };
}

// Create a new attendance sheet, then open it.
export async function createSheet(formData: FormData) {
  const supabase = await createClient();
  const { user, churchId } = await requireChurch(supabase);

  const title = String(formData.get("title") ?? "").trim();
  const activity_type = String(formData.get("activity_type") ?? "").trim();
  const categories = formData.getAll("categories").map(String);

  if (!title || !activity_type || categories.length === 0) {
    redirect(
      `/dashboard/attendance?error=${encodeURIComponent(
        "Please enter a title, activity type, and at least one category.",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("attendance_sheets")
    .insert({ church_id: churchId, title, activity_type, categories, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/attendance?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/attendance/${data.id}`);
}

// Add a service day to a sheet (creates zeroed figures for each category).
export async function addDay(formData: FormData) {
  const supabase = await createClient();
  const { churchId } = await requireChurch(supabase);

  const sheetId = String(formData.get("sheet_id") ?? "");
  const service_date = String(formData.get("service_date") ?? "");
  const day_label = String(formData.get("day_label") ?? "").trim();

  if (!sheetId || !service_date) {
    redirect(`/dashboard/attendance/${sheetId}?error=${encodeURIComponent("Pick a date for the day.")}`);
  }

  const { data: sheet } = await supabase
    .from("attendance_sheets")
    .select("categories")
    .eq("id", sheetId)
    .single();

  if (!sheet) redirect("/dashboard/attendance");

  const { data: day, error } = await supabase
    .from("attendance_days")
    .insert({ sheet_id: sheetId, church_id: churchId, service_date, day_label: day_label || null })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/attendance/${sheetId}?error=${encodeURIComponent(error.message)}`);
  }

  const rows = (sheet.categories as string[]).map((category) => ({
    day_id: day.id,
    church_id: churchId,
    category,
    male: 0,
    female: 0,
  }));
  await supabase.from("attendance_figures").insert(rows);

  revalidatePath(`/dashboard/attendance/${sheetId}`);
  redirect(`/dashboard/attendance/${sheetId}`);
}

// Save edited figures for the whole sheet (called from the client editor).
export async function saveFigures(
  sheetId: string,
  figures: { day_id: string; category: string; male: number; female: number }[],
) {
  const supabase = await createClient();
  const { churchId } = await requireChurch(supabase);

  const rows = figures.map((f) => ({
    day_id: f.day_id,
    church_id: churchId,
    category: f.category,
    male: Math.max(0, Math.floor(Number(f.male) || 0)),
    female: Math.max(0, Math.floor(Number(f.female) || 0)),
  }));

  const { error } = await supabase
    .from("attendance_figures")
    .upsert(rows, { onConflict: "day_id,category" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/attendance/${sheetId}`);
  return { ok: true };
}

// Delete a single day.
export async function deleteDay(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const dayId = String(formData.get("day_id") ?? "");
  const sheetId = String(formData.get("sheet_id") ?? "");
  await supabase.from("attendance_days").delete().eq("id", dayId);
  revalidatePath(`/dashboard/attendance/${sheetId}`);
  redirect(`/dashboard/attendance/${sheetId}`);
}

// Delete a whole sheet.
export async function deleteSheet(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const sheetId = String(formData.get("sheet_id") ?? "");
  await supabase.from("attendance_sheets").delete().eq("id", sheetId);
  revalidatePath("/dashboard/attendance");
  redirect("/dashboard/attendance");
}
