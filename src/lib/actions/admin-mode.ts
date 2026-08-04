"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const CODE_RE = /^[A-Za-z0-9]{6,}$/;

function hashCode(code: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(code, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyCode(code: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(code, salt, 32).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

type Result = { ok?: boolean; error?: string };

// First-time: an admin creates their personal code and is elevated.
export async function createAdminCode(code: string, confirm: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, admin_code_hash")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Only church admins can set an admin code." };
  if (profile?.admin_code_hash) return { error: "You already have an admin code." };
  if (!CODE_RE.test(code)) return { error: "Code must be at least 6 letters/numbers." };
  if (code !== confirm) return { error: "Codes do not match." };

  const { error } = await supabase
    .from("profiles")
    .update({ admin_code_hash: hashCode(code), elevated: true, code_attempts: 0, code_locked_until: null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

// Enter the code to elevate for this session.
export async function enableAdminMode(code: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, admin_code_hash, code_attempts, code_locked_until")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Only church admins can do this." };
  if (!profile?.admin_code_hash) return { error: "No admin code set yet." };

  const lockedUntil = profile.code_locked_until ? new Date(profile.code_locked_until as string) : null;
  if (lockedUntil && lockedUntil > new Date()) {
    return { error: `Too many attempts. Try again after ${lockedUntil.toLocaleTimeString()}.` };
  }

  if (!verifyCode(code, profile.admin_code_hash as string)) {
    const attempts = ((profile.code_attempts as number) ?? 0) + 1;
    const locked = attempts >= MAX_ATTEMPTS;
    await supabase
      .from("profiles")
      .update({
        code_attempts: locked ? 0 : attempts,
        code_locked_until: locked ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
      })
      .eq("id", user.id);
    return {
      error: locked
        ? `Too many wrong attempts. Locked for ${LOCK_MINUTES} minutes.`
        : `Incorrect code. ${MAX_ATTEMPTS - attempts} attempt(s) left.`,
    };
  }

  await supabase
    .from("profiles")
    .update({ elevated: true, code_attempts: 0, code_locked_until: null })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  return { ok: true };
}

// Drop back to member view.
export async function exitAdminMode(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  await supabase.from("profiles").update({ elevated: false }).eq("id", user.id);
  revalidatePath("/dashboard");
  return { ok: true };
}
