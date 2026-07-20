"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Church admin sets/updates the church's deposit / giving details.
export async function setGivingDetails(formData: FormData) {
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

  if (profile?.role !== "admin" || !profile?.church_id) {
    redirect(`/dashboard/donations?error=${encodeURIComponent("Only the church admin can edit giving details.")}`);
  }

  const payload = {
    giving_bank_name: String(formData.get("bank_name") ?? "").trim() || null,
    giving_account_number: String(formData.get("account_number") ?? "").trim() || null,
    giving_account_name: String(formData.get("account_name") ?? "").trim() || null,
    giving_extra: String(formData.get("extra") ?? "").trim() || null,
  };

  const { error } = await supabase
    .from("churches")
    .update(payload)
    .eq("id", profile.church_id);

  if (error) {
    redirect(`/dashboard/donations?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/dashboard/donations?saved=1`);
}
