"use client";

import { useState } from "react";

// Password field with a show/hide eye toggle.
export function PasswordInput({
  id,
  name,
  label,
  minLength,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  minLength?: number;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-deep">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          placeholder={placeholder}
          className="w-full rounded-lg border border-steel/40 px-3 py-2 pr-10 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-steel hover:text-navy"
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
