"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CHURCH_ROLES, OTHER_ROLE } from "@/lib/church-roles";

// Saves the department / ministry the signed-in user serves in.
export async function setMinistryRole(formData: FormData) {
  const choice = String(formData.get("ministry_role") ?? "").trim();
  const custom = String(formData.get("custom_role") ?? "").trim();

  // Resolve the final value: a custom entry when "Others" was picked.
  let value = choice;
  if (choice === OTHER_ROLE) value = custom;

  if (!value || (choice !== OTHER_ROLE && !CHURCH_ROLES.includes(choice))) {
    redirect(`/dashboard?error=${encodeURIComponent("Please choose your department.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ ministry_role: value })
    .eq("id", user.id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
