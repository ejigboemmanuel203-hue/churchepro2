"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CustomField = {
  label: string;
  field_type: "text" | "number" | "select";
  options?: string[];
  required: boolean;
};

export async function createProgram(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id, elevated")
    .eq("id", user.id)
    .single();

  if (!profile?.elevated || !profile?.church_id) {
    redirect(`/dashboard/donations?error=${encodeURIComponent("Only elevated admins can create programs.")}`);
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/dashboard/donations?error=${encodeURIComponent("Program title is required.")}`);

  const { data: program, error } = await supabase
    .from("programs")
    .insert({
      church_id: profile.church_id,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      date: String(formData.get("date") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/donations?error=${encodeURIComponent(error.message)}`);
  }

  const fieldsRaw = String(formData.get("custom_fields") ?? "[]");
  try {
    const fields: CustomField[] = JSON.parse(fieldsRaw);
    if (fields.length > 0) {
      const rows = fields.map((f, i) => ({
        program_id: program.id,
        label: f.label,
        field_type: f.field_type,
        options: f.field_type === "select" ? f.options ?? [] : null,
        required: f.required,
        sort_order: i,
      }));
      await supabase.from("program_custom_fields").insert(rows);
    }
  } catch {
    // ignore malformed JSON
  }

  revalidatePath("/dashboard/donations");
  redirect("/dashboard/donations?created=1");
}

export async function toggleProgramOpen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isOpen = formData.get("is_open") === "true";
  const supabase = await createClient();
  await supabase.from("programs").update({ is_open: !isOpen }).eq("id", id);
  revalidatePath("/dashboard/donations");
}

export async function deleteProgram(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("programs").delete().eq("id", id);
  revalidatePath("/dashboard/donations");
}

export async function registerForProgram(formData: FormData) {
  const programId = String(formData.get("program_id") ?? "");
  const churchId = String(formData.get("church_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName) {
    return { error: "Full name is required." };
  }

  const customDataRaw = String(formData.get("custom_data") ?? "{}");
  let customData = {};
  try {
    customData = JSON.parse(customDataRaw);
  } catch {
    // ignore
  }

  const supabase = await createClient();

  // Try to get the user id if logged in (optional for external registrants).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("program_registrations").insert({
    program_id: programId,
    church_id: churchId,
    user_id: user?.id ?? null,
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    custom_data: customData,
  });

  if (error) return { error: error.message };
  return { ok: true };
}
