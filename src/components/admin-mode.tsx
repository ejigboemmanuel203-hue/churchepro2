"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enableAdminMode, exitAdminMode } from "@/lib/actions/admin-mode";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export function AdminMode({ elevated }: { elevated: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exit() {
    setBusy(true);
    await exitAdminMode();
    setBusy(false);
    router.refresh();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await enableAdminMode(String(fd.get("code") ?? ""));
    setBusy(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  // ---- Elevated: show active banner + exit ----
  if (elevated) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-deep px-4 py-3 text-white">
        <span className="text-sm font-medium">
          🛡️ Admin mode is active — you can manage your church.
        </span>
        <button
          onClick={exit}
          disabled={busy}
          className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25 disabled:opacity-60"
        >
          View as member
        </button>
      </div>
    );
  }

  // ---- Not elevated: prompt to switch ----
  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-ice px-4 py-3 ring-1 ring-sky/20">
        <span className="text-sm text-deep">
          You&apos;re viewing as a member. Switch to admin to manage your church.
        </span>
        <button
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="shrink-0 rounded-lg bg-sky px-3 py-1.5 text-sm font-semibold text-white hover:bg-deep"
        >
          Switch to Admin
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-navy">Enter admin passcode</h2>
            <p className="mt-1 text-sm text-steel">
              Enter the church admin passcode to manage your church.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-deep">Admin passcode</label>
                <input name="code" type="password" autoComplete="off" required className={inputClass} />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="h-10 flex-1 rounded-lg bg-sky font-medium text-white hover:bg-deep disabled:opacity-60"
                >
                  {busy ? "Please wait…" : "Enter admin mode"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-lg border border-steel/30 px-4 font-medium text-deep hover:border-sky"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
