"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GLOBAL_MEDIA_BUCKET } from "@/lib/global-media";

// Inserts site-wide media metadata after the file was uploaded to storage.
// Requires the secret passkey (GLOBAL_MEDIA_PASSKEY) — this is the gate that
// stops any random media/pastor from posting to the whole site.
export async function addGlobalMedia(input: {
  title: string;
  preacher: string;
  preached_on: string;
  media_type: "audio" | "video";
  storage_path: string;
  description: string;
  passkey: string;
}) {
  const secret = process.env.GLOBAL_MEDIA_PASSKEY;
  if (!secret) {
    return { error: "Site-wide uploads are not configured yet. Ask the admin to set the passkey." };
  }
  if (input.passkey !== secret) {
    return { error: "Incorrect passkey. Site-wide upload denied." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("global_media").insert({
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

// Removes site-wide media (row + file). Media/Pastor only (RLS-enforced).
export async function deleteGlobalMedia(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("storage_path") ?? "");
  const supabase = await createClient();

  if (path) await supabase.storage.from(GLOBAL_MEDIA_BUCKET).remove([path]);
  await supabase.from("global_media").delete().eq("id", id);
  revalidatePath("/dashboard/sermons");
}
