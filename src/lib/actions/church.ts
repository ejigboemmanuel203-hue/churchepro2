"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Creates a new church and makes the current user its admin.
// Uses the secure `create_church` database function.
export async function createChurch(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(`/dashboard?error=${encodeURIComponent("Please enter a church name.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_church", { church_name: name });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
