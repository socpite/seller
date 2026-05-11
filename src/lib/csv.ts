export function toCsv(rows: Record<string, unknown>[], headers?: string[]): string {
  if (rows.length === 0) return headers ? headers.join(",") + "\n" : "";
  const cols = headers ?? Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" && "toString" in v ? v.toString() : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  return lines.join("\n");
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
