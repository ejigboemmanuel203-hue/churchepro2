"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SERMON_BUCKET } from "@/lib/sermons";

// Inserts sermon metadata after the file has been uploaded to storage
// (client-side). RLS guarantees only Media Personnel / Pastor can insert.
export async function addSermon(input: {
  title: string;
  preacher: string;
  preached_on: string;
  media_type: "audio" | "video";
  storage_path: string;
  description: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id")
    .eq("id", user.id)
    .single();

  if (!profile?.church_id) return { error: "No church found." };

  const { error } = await supabase.from("sermons").insert({
    church_id: profile.church_id,
    title: input.title.trim(),
    preacher: input.preacher.trim() || null,
    preached_on: input.preached_on || null,
    media_type: input.media_type,
    storage_path: input.storage_path,
    description: input.description.trim() || null,
    uploaded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/sermons");
  return { error: null };
}

// Removes a sermon row and its underlying file.
export async function deleteSermon(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("storage_path") ?? "");
  const supabase = await createClient();

  // Remove the file first (ignore storage error, still clear the row).
  if (path) await supabase.storage.from(SERMON_BUCKET).remove([path]);

  await supabase.from("sermons").delete().eq("id", id);
  revalidatePath("/dashboard/sermons");
}
