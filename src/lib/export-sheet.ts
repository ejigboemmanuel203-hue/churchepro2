// Builders that turn attendance sheet data into downloadable files.
// Heavy libraries are dynamically imported so they only load on demand.

import { categoryLabel } from "@/lib/attendance";

export type SheetExportData = {
  churchName: string;
  title: string;
  activityType: string;
  categories: string[];
  days: { label: string; date: string; figures: Record<string, { male: number; female: number }> }[];
};

function fileBase(d: SheetExportData) {
  return (d.title || "attendance").replace(/[^a-z0-9]+/gi, "_");
}

function val(d: SheetExportData, i: number, cat: string) {
  return d.days[i].figures[cat] ?? { male: 0, female: 0 };
}
function dayMale(d: SheetExportData, i: number) {
  return d.categories.reduce((s, c) => s + val(d, i, c).male, 0);
}
function dayFemale(d: SheetExportData, i: number) {
  return d.categories.reduce((s, c) => s + val(d, i, c).female, 0);
}
function dayTotal(d: SheetExportData, i: number) {
  return dayMale(d, i) + dayFemale(d, i);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------- Excel (.xlsx)
export async function exportExcel(d: SheetExportData) {
  const XLSX = await import("xlsx");
  const cols = 1 + d.categories.length * 2 + 1;

  const rows: (string | number)[][] = [];
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  const push = (r: (string | number)[]) => rows.push(r) - 1;

  const titleR = push([d.churchName]);
  merges.push({ s: { r: titleR, c: 0 }, e: { r: titleR, c: cols - 1 } });
  const subR = push([`${d.title} — ${d.activityType}`]);
  merges.push({ s: { r: subR, c: 0 }, e: { r: subR, c: cols - 1 } });
  push([]);

  const h1: (string | number)[] = ["Day"];
  d.categories.forEach((c) => h1.push(categoryLabel(c), ""));
  h1.push("Day Total");
  const h1R = push(h1);
  const h2: (string | number)[] = [""];
  d.categories.forEach(() => h2.push("M", "F"));
  h2.push("");
  push(h2);
  d.categories.forEach((_, idx) => {
    const c = 1 + idx * 2;
    merges.push({ s: { r: h1R, c }, e: { r: h1R, c: c + 1 } });
  });

  d.days.forEach((day, i) => {
    const r: (string | number)[] = [`${day.label} (${day.date})`];
    d.categories.forEach((c) => {
      const v = val(d, i, c);
      r.push(v.male, v.female);
    });
    r.push(dayTotal(d, i));
    push(r);

    // per-day subtotal directly under the day
    const sub: (string | number)[] = ["Subtotal", `Male ${dayMale(d, i)} · Female ${dayFemale(d, i)}`];
    while (sub.length < cols - 1) sub.push("");
    sub.push(dayTotal(d, i));
    const sR = push(sub);
    merges.push({ s: { r: sR, c: 1 }, e: { r: sR, c: cols - 2 } });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;
  ws["!cols"] = Array.from({ length: cols }, (_, i) => ({ wch: i === 0 ? 18 : 7 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${fileBase(d)}.xlsx`,
  );
}

// -------------------------------------------------------------- Word (.docx)
export async function exportWord(d: SheetExportData) {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, PageOrientation,
  } = await import("docx");

  const nCats = d.categories.length;
  const totalWidth = 12960; // landscape Letter content width (DXA)
  const dayW = 1800;
  const dayTotalW = 1160;
  const mfW = Math.floor((totalWidth - dayW - dayTotalW) / (nCats * 2));
  const colWidths = [dayW, ...Array(nCats * 2).fill(mfW), dayTotalW];

  const border = { style: BorderStyle.SINGLE, size: 4, color: "9AA7B2" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const cell = (
    text: string | number,
    opts: { w: number; bold?: boolean; fill?: string; colSpan?: number; rowSpan?: number; color?: string } = { w: mfW },
  ) =>
    new TableCell({
      borders,
      width: { size: opts.w, type: WidthType.DXA },
      columnSpan: opts.colSpan,
      rowSpan: opts.rowSpan,
      verticalAlign: VerticalAlign.CENTER,
      shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: String(text), bold: opts.bold, color: opts.color, size: 18 })],
        }),
      ],
    });

  const headRow1 = new TableRow({
    tableHeader: true,
    children: [
      cell("Day", { w: dayW, bold: true, fill: "1E2D3F", color: "FFFFFF", rowSpan: 2 }),
      ...d.categories.map((c) =>
        cell(categoryLabel(c), { w: mfW * 2, bold: true, fill: "2A5680", color: "FFFFFF", colSpan: 2 }),
      ),
      cell("Day Total", { w: dayTotalW, bold: true, fill: "1E2D3F", color: "FFFFFF", rowSpan: 2 }),
    ],
  });
  const headRow2 = new TableRow({
    tableHeader: true,
    children: d.categories.flatMap(() => [
      cell("M", { w: mfW, bold: true, fill: "5F8299", color: "FFFFFF" }),
      cell("F", { w: mfW, bold: true, fill: "5F8299", color: "FFFFFF" }),
    ]),
  });

  const dayRows = d.days.flatMap((day, i) => [
    new TableRow({
      children: [
        cell(`${day.label} (${day.date})`, { w: dayW, bold: true }),
        ...d.categories.flatMap((c) => {
          const v = val(d, i, c);
          return [cell(v.male, { w: mfW }), cell(v.female, { w: mfW })];
        }),
        cell(dayTotal(d, i), { w: dayTotalW, bold: true }),
      ],
    }),
    new TableRow({
      children: [
        cell("Subtotal", { w: dayW, fill: "E3F2FD" }),
        cell(`Male ${dayMale(d, i)}  ·  Female ${dayFemale(d, i)}`, {
          w: mfW * nCats * 2,
          fill: "E3F2FD",
          colSpan: nCats * 2,
        }),
        cell(dayTotal(d, i), { w: dayTotalW, bold: true, fill: "E3F2FD" }),
      ],
    }),
  ]);

  const table = new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headRow1, headRow2, ...dayRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: d.churchName, bold: true, size: 32, color: "1E2D3F" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `${d.title} — ${d.activityType}`, size: 24, color: "2A5680" })],
          }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${fileBase(d)}.docx`);
}
