"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type Result = { ok?: boolean; error?: string };

// Constant-time compare of the entered code against the master passcode
// (ADMIN_MASTER_CODE). Never leaks whether the code is configured via timing.
function matchesMasterCode(entered: string): boolean {
  const master = process.env.ADMIN_MASTER_CODE ?? "";
  if (!master) return false;
  const a = Buffer.from(entered);
  const b = Buffer.from(master);
  // Pad to equal length so timingSafeEqual doesn't throw and length isn't leaked.
  const len = Math.max(a.length, b.length);
  const pa = Buffer.alloc(len);
  const pb = Buffer.alloc(len);
  a.copy(pa);
  b.copy(pb);
  return timingSafeEqual(pa, pb) && a.length === b.length;
}

// Shared: verify the master code with rate-limiting, then elevate the user.
async function elevateWithCode(code: string, accessMode: "admin"): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  if (!process.env.ADMIN_MASTER_CODE) {
    return { error: "Admin passcode isn't configured yet. Contact the site owner." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("code_attempts, code_locked_until")
    .eq("id", user.id)
    .maybeSingle();

  const lockedUntil = profile?.code_locked_until
    ? new Date(profile.code_locked_until as string)
    : null;
  if (lockedUntil && lockedUntil > new Date()) {
    return { error: `Too many attempts. Try again after ${lockedUntil.toLocaleTimeString()}.` };
  }

  if (!matchesMasterCode(code)) {
    const attempts = ((profile?.code_attempts as number) ?? 0) + 1;
    const locked = attempts >= MAX_ATTEMPTS;
    await supabase
      .from("profiles")
      .update({
        code_attempts: locked ? 0 : attempts,
        code_locked_until: locked
          ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString()
          : null,
      })
      .eq("id", user.id);
    return {
      error: locked
        ? `Too many wrong attempts. Locked for ${LOCK_MINUTES} minutes.`
        : `Incorrect passcode. ${MAX_ATTEMPTS - attempts} attempt(s) left.`,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      access_mode: accessMode,
      role: "admin",
      elevated: true,
      admin_mode: "creator",
      code_attempts: 0,
      code_locked_until: null,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

// Onboarding choice: "Continue as member/worker" or "Continue as admin".
// Admin requires the correct master passcode; member proceeds with no code.
export async function chooseAccessMode(
  mode: "member" | "admin",
  code?: string,
): Promise<Result> {
  if (mode === "admin") {
    return elevateWithCode(String(code ?? ""), "admin");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ access_mode: "member", role: "member", elevated: false })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

// Dashboard: re-enter admin mode this session by typing the master passcode.
export async function enableAdminMode(code: string): Promise<Result> {
  return elevateWithCode(code, "admin");
}

// Switch between admin sub-modes (creator/analysis) while staying elevated.
export async function switchAdminMode(mode: "creator" | "analysis"): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("profiles")
    .update({ admin_mode: mode })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

// Drop back to member view (stays a member until the code is entered again).
export async function exitAdminMode(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  await supabase.from("profiles").update({ elevated: false, admin_mode: "member" }).eq("id", user.id);
  revalidatePath("/dashboard");
  return { ok: true };
}
