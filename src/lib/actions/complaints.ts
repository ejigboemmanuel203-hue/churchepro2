"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_KINDS } from "@/lib/complaints";

export async function submitComplaint(formData: FormData) {
  const kind = String(formData.get("kind") ?? "suggestion").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`/dashboard/complaints?error=${encodeURIComponent("Please write your message.")}`);
  }
  const validKind = COMPLAINT_KINDS.some((c) => c.key === kind) ? kind : "suggestion";

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
    redirect(`/dashboard/complaints?error=${encodeURIComponent("No church found.")}`);
  }

  const { error } = await supabase.from("complaints").insert({
    church_id: profile.church_id,
    kind: validKind,
    body,
  });

  if (error) {
    redirect(`/dashboard/complaints?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/complaints?sent=1`);
}

export async function markComplaintRead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("complaints").update({ is_read: true }).eq("id", id);
  revalidatePath("/dashboard/complaints");
}

export async function deleteComplaint(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("complaints").delete().eq("id", id);
  revalidatePath("/dashboard/complaints");
}
