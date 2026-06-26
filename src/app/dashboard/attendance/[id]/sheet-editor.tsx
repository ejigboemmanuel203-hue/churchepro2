"use client";

import { type CSSProperties, type ReactNode, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel } from "@/lib/attendance";
import { saveFigures } from "@/lib/actions/attendance";
import { exportExcel, exportWord, type SheetExportData } from "@/lib/export-sheet";

type DayData = {
  id: string;
  service_date: string;
  day_label: string;
  figures: Record<string, { male: number; female: number }>;
};

type Values = Record<string, Record<string, { male: number; female: number }>>;

// Brand colors as hex (inline styles -> clean PNG/PDF capture)
const C = { navy: "#1E2D3F", deep: "#2A5680", steel: "#5F8299", ice: "#E3F2FD", sky: "#29A3E5" };

export function SheetEditor({
  sheetId,
  churchName,
  title,
  activityType,
  categories,
  days,
  deleteDayAction,
}: {
  sheetId: string;
  churchName: string;
  title: string;
  activityType: string;
  categories: string[];
  days: DayData[];
  deleteDayAction: (formData: FormData) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fileBase = (title || "attendance").replace(/[^a-z0-9]+/gi, "_");

  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const d of days) {
      v[d.id] = {};
      for (const c of categories) {
        v[d.id][c] = { male: d.figures[c]?.male ?? 0, female: d.figures[c]?.female ?? 0 };
      }
    }
    return v;
  });

  function setVal(dayId: string, cat: string, field: "male" | "female", raw: string) {
    const n = Math.max(0, Math.floor(Number(raw) || 0));
    setValues((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [cat]: { ...prev[dayId][cat], [field]: n } },
    }));
    setSaved(false);
  }

  const dayTotal = (dayId: string) =>
    categories.reduce((s, c) => s + values[dayId][c].male + values[dayId][c].female, 0);
  const dayMale = (dayId: string) =>
    categories.reduce((s, c) => s + values[dayId][c].male, 0);
  const dayFemale = (dayId: string) =>
    categories.reduce((s, c) => s + values[dayId][c].female, 0);

  function handleSave() {
    const figures: { day_id: string; category: string; male: number; female: number }[] = [];
    for (const d of days)
      for (const c of categories)
        figures.push({ day_id: d.id, category: c, male: values[d.id][c].male, female: values[d.id][c].female });
    startTransition(async () => {
      const res = await saveFigures(sheetId, figures);
      if (res?.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function buildExportData(): SheetExportData {
    return {
      churchName,
      title,
      activityType,
      categories,
      days: days.map((d) => ({ label: d.day_label || "Day", date: d.service_date, figures: values[d.id] })),
    };
  }

  async function exportPng() {
    if (!printRef.current) return;
    setExporting("png");
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(printRef.current, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${fileBase}.png`;
      a.click();
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    if (!printRef.current) return;
    setExporting("pdf");
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const dataUrl = await toPng(printRef.current, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const orientation = img.width >= img.height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "pt", format: [img.width, img.height] });
      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      pdf.save(`${fileBase}.pdf`);
    } finally {
      setExporting(null);
    }
  }

  async function runExport(kind: string, fn: () => Promise<void>) {
    setExporting(kind);
    try {
      await fn();
    } finally {
      setExporting(null);
    }
  }

  if (days.length === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
        Add your first service day above to start entering figures.
      </section>
    );
  }

  const cell = "border border-steel/30 px-2 py-1 text-center";
  const headCell = "border border-steel/30 px-2 py-2 text-center text-white";
  const input =
    "w-14 rounded border border-steel/30 px-1 py-1 text-center text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Attendance figures</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved ✓</span>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-sky px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save figures"}
          </button>
        </div>
      </div>

      {/* Editable grid */}
      <div className="mt-4 overflow-x-auto rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th rowSpan={2} className={`${headCell} bg-navy`}>Day</th>
              {categories.map((c) => (
                <th key={c} colSpan={2} className={`${headCell} bg-deep`}>{categoryLabel(c)}</th>
              ))}
              <th rowSpan={2} className={`${headCell} bg-navy`}>Day Total</th>
            </tr>
            <tr>
              {categories.map((c) => (
                <Fragment2 key={c}>
                  <th className={`${headCell} bg-steel`}>M</th>
                  <th className={`${headCell} bg-steel`}>F</th>
                </Fragment2>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <Fragment2 key={d.id}>
                <tr>
                  <td className={`${cell} text-left font-medium text-navy`}>
                    <div>{d.day_label || "Day"}</div>
                    <div className="text-xs text-steel">{d.service_date}</div>
                  </td>
                  {categories.map((c) => (
                    <Fragment2 key={c}>
                      <td className={cell}>
                        <input type="number" min={0} value={values[d.id][c].male} onChange={(e) => setVal(d.id, c, "male", e.target.value)} className={input} />
                      </td>
                      <td className={cell}>
                        <input type="number" min={0} value={values[d.id][c].female} onChange={(e) => setVal(d.id, c, "female", e.target.value)} className={input} />
                      </td>
                    </Fragment2>
                  ))}
                  <td className={`${cell} font-semibold text-navy`}>{dayTotal(d.id)}</td>
                </tr>
                <tr className="bg-ice">
                  <td className={`${cell} text-left text-xs font-semibold text-steel`}>Subtotal</td>
                  <td colSpan={categories.length * 2} className={`${cell} font-semibold text-navy`}>
                    Male {dayMale(d.id)} · Female {dayFemale(d.id)}
                  </td>
                  <td className={`${cell} font-bold text-sky`}>{dayTotal(d.id)}</td>
                </tr>
              </Fragment2>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-day delete controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        {days.map((d) => (
          <form key={d.id} action={deleteDayAction}>
            <input type="hidden" name="day_id" value={d.id} />
            <input type="hidden" name="sheet_id" value={sheetId} />
            <button className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
              Remove {d.day_label || d.service_date}
            </button>
          </form>
        ))}
      </div>

      {/* Export toolbar */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <h2 className="mr-2 text-lg font-bold text-navy">Download &amp; share</h2>
        <ExportButton label="PNG (image)" busy={exporting === "png"} onClick={exportPng} primary />
        <ExportButton label="PDF" busy={exporting === "pdf"} onClick={exportPdf} />
        <ExportButton label="Word" busy={exporting === "docx"} onClick={() => runExport("docx", () => exportWord(buildExportData()))} />
        <ExportButton label="Excel" busy={exporting === "xlsx"} onClick={() => runExport("xlsx", () => exportExcel(buildExportData()))} />
      </div>
      <p className="mt-2 text-xs text-steel">Exports reflect what&apos;s on screen now. Tip: PNG is best for WhatsApp/Instagram.</p>

      {/* Printable / shareable sheet preview (captured for PNG & PDF) */}
      <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-black/5">
        <div ref={printRef} style={{ background: "#fff", padding: 24, minWidth: "fit-content" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{churchName}</div>
            <div style={{ fontSize: 14, color: C.deep }}>{title} — {activityType}</div>
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, color: C.navy }}>
            <thead>
              <tr>
                <th rowSpan={2} style={th(C.navy)}>Day</th>
                {categories.map((c) => (
                  <th key={c} colSpan={2} style={th(C.deep)}>{categoryLabel(c)}</th>
                ))}
                <th rowSpan={2} style={th(C.navy)}>Day Total</th>
              </tr>
              <tr>
                {categories.map((c) => (
                  <Fragment2 key={c}>
                    <th style={th(C.steel)}>M</th>
                    <th style={th(C.steel)}>F</th>
                  </Fragment2>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <Fragment2 key={d.id}>
                  <tr>
                    <td style={{ ...td(), textAlign: "left", fontWeight: 600 }}>
                      {d.day_label || "Day"} <span style={{ color: C.steel, fontWeight: 400 }}>({d.service_date})</span>
                    </td>
                    {categories.map((c) => (
                      <Fragment2 key={c}>
                        <td style={td()}>{values[d.id][c].male}</td>
                        <td style={td()}>{values[d.id][c].female}</td>
                      </Fragment2>
                    ))}
                    <td style={{ ...td(), fontWeight: 700 }}>{dayTotal(d.id)}</td>
                  </tr>
                  <tr style={{ background: C.ice }}>
                    <td style={{ ...td(), textAlign: "left", fontWeight: 600, color: C.steel }}>Subtotal</td>
                    <td colSpan={categories.length * 2} style={{ ...td(), fontWeight: 600 }}>
                      Male {dayMale(d.id)} · Female {dayFemale(d.id)}
                    </td>
                    <td style={{ ...td(), fontWeight: 700, color: C.sky }}>{dayTotal(d.id)}</td>
                  </tr>
                </Fragment2>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function th(bg: string): CSSProperties {
  return { border: "1px solid #9AA7B2", padding: "6px 8px", textAlign: "center", color: "#fff", background: bg, fontWeight: 700 };
}
function td(): CSSProperties {
  return { border: "1px solid #9AA7B2", padding: "5px 8px", textAlign: "center" };
}

function Fragment2({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ExportButton({
  label,
  busy,
  onClick,
  primary,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={
        primary
          ? "rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
          : "rounded-lg border border-steel/40 bg-white px-4 py-2 text-sm font-medium text-deep transition-colors hover:border-sky disabled:opacity-60"
      }
    >
      {busy ? "Working…" : label}
    </button>
  );
}
