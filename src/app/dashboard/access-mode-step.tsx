"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { chooseAccessMode } from "@/lib/actions/admin-mode";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

// Shown once during onboarding, right before the department picker.
// The user chooses how they'll use Churchepro: as a member/worker, or as an
// admin (which requires the church admin passcode).
export function AccessModeStep({ churchName }: { churchName: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"member" | "admin" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickMember() {
    setBusy(true);
    setError(null);
    const res = await chooseAccessMode("member");
    setBusy(false);
    if (res?.error) return setError(res.error);
    router.refresh();
  }

  async function submitAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await chooseAccessMode("admin", String(fd.get("code") ?? ""));
    setBusy(false);
    if (res?.error) return setError(res.error);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
      <h1 className="font-display text-2xl font-bold text-navy">
        How will you use {churchName}?
      </h1>
      <p className="mt-2 text-steel">
        Choose how you&apos;re joining. You can always switch later.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 grid gap-3">
        {/* Member / worker */}
        <button
          type="button"
          onClick={() => setMode("member")}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            mode === "member" ? "border-sky bg-ice" : "border-steel/20 hover:border-sky/50"
          }`}
        >
          <p className="font-semibold text-navy">👤 Continue as member / worker</p>
          <p className="mt-1 text-sm text-steel">
            Mark attendance, submit prayer requests, take the quiz, and more.
          </p>
        </button>

        {/* Admin */}
        <button
          type="button"
          onClick={() => setMode("admin")}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            mode === "admin" ? "border-sky bg-ice" : "border-steel/20 hover:border-sky/50"
          }`}
        >
          <p className="font-semibold text-navy">🛡️ Continue as admin</p>
          <p className="mt-1 text-sm text-steel">
            Manage church settings and giving details. Requires the admin passcode.
          </p>
        </button>
      </div>

      {/* Admin passcode entry */}
      {mode === "admin" && (
        <form onSubmit={submitAdmin} className="mt-5">
          <label className="block text-sm font-medium text-deep">Admin passcode</label>
          <input
            name="code"
            type="password"
            autoComplete="off"
            required
            placeholder="Enter the church admin passcode"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-4 h-11 w-full rounded-lg bg-sky font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Continue as admin"}
          </button>
        </form>
      )}

      {/* Member continue */}
      {mode === "member" && (
        <button
          type="button"
          onClick={pickMember}
          disabled={busy}
          className="mt-5 h-11 w-full rounded-lg bg-sky font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
        >
          {busy ? "Please wait…" : "Continue as member / worker"}
        </button>
      )}
    </div>
  );
}
