"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enableAdminMode, exitAdminMode, switchAdminMode } from "@/lib/actions/admin-mode";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

type AdminModeType = "creator" | "analysis" | "member";

const MODES: { key: AdminModeType; label: string; desc: string; icon: string }[] = [
  { key: "creator", label: "Creator mode", desc: "Create programs, edit giving details, manage church settings.", icon: "🛠️" },
  { key: "analysis", label: "Analysis mode", desc: "View active users, attendance stats, program registrations.", icon: "📊" },
  { key: "member", label: "Member mode", desc: "View as a normal member — no admin controls.", icon: "👤" },
];

// Shown on the dashboard for elevated admins — lets them switch between modes.
export function AdminMode({
  elevated,
  currentMode,
}: {
  elevated: boolean;
  currentMode: string;
}) {
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

  async function changeMode(mode: AdminModeType) {
    setBusy(true);
    if (mode === "member") {
      await exitAdminMode();
    } else {
      await switchAdminMode(mode);
    }
    setBusy(false);
    router.refresh();
  }

  // ---- Elevated: show mode switcher ----
  if (elevated) {
    const current = MODES.find((m) => m.key === currentMode) ?? MODES[0];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-deep px-4 py-3 text-white">
          <span className="text-sm font-medium">
            {current.icon} {current.label} — you can manage your church.
          </span>
          <button
            onClick={exit}
            disabled={busy}
            className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25 disabled:opacity-60"
          >
            Exit admin
          </button>
        </div>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => changeMode(m.key)}
              disabled={busy || m.key === currentMode}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                m.key === currentMode
                  ? "bg-sky text-white"
                  : "bg-ice text-deep hover:bg-sky/10"
              } disabled:opacity-60`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Not elevated: hidden for non-admins (they see "Become an admin" in nav) ----
  return (
    <>
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

// Shown in the nav bar for non-admin users — "Become an admin" link.
export function BecomeAdminButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true); }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-steel transition-colors hover:bg-ice/60 hover:text-navy"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Become an admin
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-navy">Become an admin</h2>
            <p className="mt-1 text-sm text-steel">
              Enter the church admin passcode to unlock admin features.
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
                  {busy ? "Please wait…" : "Become admin"}
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
