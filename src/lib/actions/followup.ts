"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireChurch(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.church_id) redirect("/dashboard");
  return { user, churchId: profile.church_id as string, isAdmin: profile.role === "admin" };
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const { user, churchId } = await requireChurch(supabase);

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (!full_name) redirect(`/dashboard/followup?error=${encodeURIComponent("Name is required.")}`);

  const assigned = String(formData.get("assigned_to") ?? "");
  const first_seen = String(formData.get("first_seen") ?? "");

  const { error } = await supabase.from("contacts").insert({
    church_id: churchId,
    full_name,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    contact_type: String(formData.get("contact_type") ?? "visitor"),
    source: String(formData.get("source") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    first_seen: first_seen || null,
    assigned_to: assigned || null,
    created_by: user.id,
  });

  if (error) redirect(`/dashboard/followup?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/followup");
  redirect("/dashboard/followup");
}

export async function updateContactStatus(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const id = String(formData.get("contact_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
  if (error) redirect(`/dashboard/followup/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/dashboard/followup/${id}`);
  redirect(`/dashboard/followup/${id}`);
}

export async function assignContact(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const id = String(formData.get("contact_id") ?? "");
  const assigned = String(formData.get("assigned_to") ?? "");
  const { error } = await supabase.from("contacts").update({ assigned_to: assigned || null }).eq("id", id);
  if (error) redirect(`/dashboard/followup/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/dashboard/followup/${id}`);
  redirect(`/dashboard/followup/${id}`);
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const id = String(formData.get("contact_id") ?? "");
  await supabase.from("contacts").delete().eq("id", id);
  revalidatePath("/dashboard/followup");
  redirect("/dashboard/followup");
}

export async function addLog(formData: FormData) {
  const supabase = await createClient();
  const { user, churchId } = await requireChurch(supabase);
  const contact_id = String(formData.get("contact_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const method = String(formData.get("method") ?? "call");
  if (!note) redirect(`/dashboard/followup/${contact_id}?error=${encodeURIComponent("Add a note.")}`);

  const { error } = await supabase.from("followup_logs").insert({
    church_id: churchId,
    contact_id,
    note,
    method,
    logged_by: user.id,
  });
  if (error) redirect(`/dashboard/followup/${contact_id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/dashboard/followup/${contact_id}`);
  redirect(`/dashboard/followup/${contact_id}`);
}

export async function deleteLog(formData: FormData) {
  const supabase = await createClient();
  await requireChurch(supabase);
  const id = String(formData.get("log_id") ?? "");
  const contact_id = String(formData.get("contact_id") ?? "");
  await supabase.from("followup_logs").delete().eq("id", id);
  revalidatePath(`/dashboard/followup/${contact_id}`);
  redirect(`/dashboard/followup/${contact_id}`);
}
