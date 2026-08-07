"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logEvangelismEntry(formData: FormData) {
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
  if (!profile?.church_id) redirect("/dashboard");

  const { error } = await supabase.from("evangelism_entries").insert({
    church_id: profile.church_id,
    user_id: user.id,
    person_name: String(formData.get("person_name") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    won: formData.get("won") === "true",
  });

  if (error) {
    redirect(`/dashboard/followup?tab=evangelism&error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/followup");
  redirect("/dashboard/followup?tab=evangelism");
}

export async function deleteEvangelismEntry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("evangelism_entries").delete().eq("id", id);
  revalidatePath("/dashboard/followup");
  redirect("/dashboard/followup?tab=evangelism");
}
