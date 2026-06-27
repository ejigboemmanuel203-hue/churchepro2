"use client";

import { useState } from "react";
import { CHURCH_ROLES, OTHER_ROLE } from "@/lib/church-roles";
import { setMinistryRole } from "@/lib/actions/profile";

// Shown once after a user joins a church: pick the department they serve in.
export function DepartmentSelect({ churchName }: { churchName: string }) {
  const [choice, setChoice] = useState("");
  const isOther = choice === OTHER_ROLE;

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
      <h1 className="text-2xl font-bold text-navy">Where do you serve?</h1>
      <p className="mt-2 text-steel">
        Welcome to {churchName}! Let your church know which department or ministry
        you&apos;re part of. Choose the one that best describes how you serve.
      </p>

      <form action={setMinistryRole} className="mt-6 space-y-4">
        <div>
          <label htmlFor="ministry_role" className="block text-sm font-medium text-deep">
            Department / Ministry
          </label>
          <select
            id="ministry_role"
            name="ministry_role"
            required
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-steel/40 bg-white px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
          >
            <option value="" disabled>
              Select your department
            </option>
            {CHURCH_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {isOther && (
          <div>
            <label htmlFor="custom_role" className="block text-sm font-medium text-deep">
              Please specify your role
            </label>
            <input
              id="custom_role"
              name="custom_role"
              type="text"
              required
              placeholder="e.g. Drama Ministry Coordinator"
              className="mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
            />
          </div>
        )}

        <button
          type="submit"
          className="mt-2 h-11 w-full rounded-lg bg-sky font-semibold text-white transition-colors hover:bg-deep"
        >
          Continue
        </button>
        <p className="text-center text-xs text-steel">
          You can update this later from your profile.
        </p>
      </form>
    </div>
  );
}
