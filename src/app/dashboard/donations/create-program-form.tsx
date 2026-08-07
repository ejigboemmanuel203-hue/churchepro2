"use client";

import { useState } from "react";
import { createProgram } from "@/lib/actions/programs";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

type CustomField = {
  label: string;
  field_type: "text" | "number" | "select";
  options: string[];
  required: boolean;
};

export function CreateProgramForm() {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);

  function addField() {
    setFields([...fields, { label: "", field_type: "text", options: [], required: false }]);
  }

  function removeField(i: number) {
    setFields(fields.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, patch: Partial<CustomField>) {
    setFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep"
      >
        + Create program
      </button>
    );
  }

  return (
    <form
      action={(fd) => {
        fd.set("custom_fields", JSON.stringify(fields));
        createProgram(fd);
      }}
      className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <h3 className="font-bold text-navy">New program</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-deep">Title *</label>
          <input name="title" required className={inputClass} placeholder="e.g. Youth Conference 2026" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-deep">Description</label>
          <textarea name="description" rows={2} className={inputClass} placeholder="What is this program about?" />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Date</label>
          <input name="date" type="date" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Location</label>
          <input name="location" className={inputClass} placeholder="e.g. Church auditorium" />
        </div>
      </div>

      {/* Custom fields */}
      <div className="mt-6">
        <p className="text-sm font-medium text-deep">Custom registration fields</p>
        <p className="text-xs text-steel">Add extra fields registrants fill in (e.g. T-shirt size).</p>

        {fields.map((f, i) => (
          <div key={i} className="mt-3 rounded-lg border border-steel/30 p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  value={f.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  placeholder="Field label"
                  className={inputClass}
                />
              </div>
              <select
                value={f.field_type}
                onChange={(e) => updateField(i, { field_type: e.target.value as CustomField["field_type"] })}
                className="mt-1 rounded-lg border border-steel/40 px-2 py-2 text-sm text-navy"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown</option>
              </select>
              <button
                type="button"
                onClick={() => removeField(i)}
                className="mt-1 text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            {f.field_type === "select" && (
              <div className="mt-2">
                <input
                  value={f.options.join(", ")}
                  onChange={(e) =>
                    updateField(i, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Options (comma-separated): Small, Medium, Large"
                  className={inputClass}
                />
              </div>
            )}
            <label className="mt-2 flex items-center gap-2 text-sm text-steel">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => updateField(i, { required: e.target.checked })}
                className="h-4 w-4 accent-sky"
              />
              Required
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={addField}
          className="mt-3 text-sm font-medium text-sky hover:text-deep"
        >
          + Add custom field
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          className="h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep"
        >
          Create program
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setFields([]); }}
          className="h-11 rounded-lg border border-steel/30 px-4 font-medium text-deep hover:border-sky"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
