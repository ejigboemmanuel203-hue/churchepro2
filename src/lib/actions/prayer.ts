"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRAYER_CATEGORIES } from "@/lib/prayer";

// Submit an anonymous prayer request. The sender is never stored — we only
// record which church it belongs to (so the right prayer team receives it).
export async function submitPrayerRequest(formData: FormData) {
  const category = String(formData.get("category") ?? "general").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`/dashboard/prayer?error=${encodeURIComponent("Please write your prayer request.")}`);
  }
  const validCategory = PRAYER_CATEGORIES.some((c) => c.key === category)
    ? category
    : "general";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id")
    .eq("id", user.id)
    .single();
  if (!profile?.church_id) {
    redirect(`/dashboard/prayer?error=${encodeURIComponent("No church found.")}`);
  }

  const { error } = await supabase.from("prayer_requests").insert({
    church_id: profile.church_id,
    category: validCategory,
    body,
    // intentionally no sender field — anonymous
  });

  if (error) {
    redirect(`/dashboard/prayer?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/prayer?sent=1`);
}

// Mark a request as read (prayer team only — enforced by RLS).
export async function markPrayerRead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("prayer_requests").update({ is_read: true }).eq("id", id);
  revalidatePath("/dashboard/prayer");
}

// Delete a request (prayer team only — enforced by RLS).
export async function deletePrayerRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("prayer_requests").delete().eq("id", id);
  revalidatePath("/dashboard/prayer");
}
