"use client";

import { useState } from "react";
import { registerForProgram } from "@/lib/actions/programs";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

type CustomField = {
  id: string;
  label: string;
  field_type: "text" | "number" | "select";
  options: string[] | null;
  required: boolean;
};

export function PublicRegistrationForm({
  programId,
  churchId,
  customFields,
}: {
  programId: string;
  churchId: string;
  customFields: CustomField[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.set("program_id", programId);
    fd.set("church_id", churchId);
    fd.set("custom_data", JSON.stringify(customValues));

    const res = await registerForProgram(fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-bold text-navy">You&apos;re registered!</h2>
        <p className="mt-2 text-steel">
          Thank you for registering. We look forward to seeing you.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="font-bold text-navy">Register</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-deep">Full name *</label>
          <input name="full_name" required className={inputClass} placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Phone</label>
          <input name="phone" type="tel" className={inputClass} placeholder="e.g. 0801 234 5678" />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Email</label>
          <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
        </div>

        {customFields.map((f) => (
          <div key={f.id}>
            <label className="block text-sm font-medium text-deep">
              {f.label}{f.required ? " *" : ""}
            </label>
            {f.field_type === "select" ? (
              <select
                required={f.required}
                value={customValues[f.label] ?? ""}
                onChange={(e) =>
                  setCustomValues({ ...customValues, [f.label]: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select…</option>
                {(f.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.field_type === "number" ? "number" : "text"}
                required={f.required}
                value={customValues[f.label] ?? ""}
                onChange={(e) =>
                  setCustomValues({ ...customValues, [f.label]: e.target.value })
                }
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 h-11 w-full rounded-lg bg-sky font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
      >
        {busy ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
