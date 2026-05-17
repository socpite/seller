"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importProductsBatch, refreshProducts } from "./actions";

const BATCH_SIZE = 50;

type Result = { inserted: number; updated: number; skipped: number; errors: string[] };

export function ImportForm() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    setBusy(true);
    setErr(null);
    setResult(null);
    setProgress(0);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      setTotal(rows.length);

      const agg: Result = { inserted: 0, updated: 0, skipped: 0, errors: [] };
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const r = await importProductsBatch(batch);
        agg.inserted += r.inserted;
        agg.updated += r.updated;
        agg.skipped += r.skipped;
        agg.errors.push(...r.errors);
        setProgress(Math.min(i + batch.length, rows.length));
        setResult({ ...agg });
      }
      await refreshProducts();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <form onSubmit={handleFile} className="bg-white border rounded-lg p-4 space-y-3">
      <input
        type="file"
        name="file"
        accept=".xlsx,.xls"
        required
        disabled={busy}
        className="block text-sm w-full border rounded px-3 py-2 bg-white file:mr-3 file:border-0 file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded file:cursor-pointer hover:file:bg-blue-700 disabled:opacity-50"
      />
      <button
        disabled={busy}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Đang import..." : "Bắt đầu import"}
      </button>

      {busy || total > 0 ? (
        <div className="space-y-1">
          <div className="h-3 bg-neutral-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-neutral-600">
            {progress} / {total} dòng ({pct}%)
          </div>
        </div>
      ) : null}

      {err && <div className="text-sm text-red-600">Lỗi: {err}</div>}

      {result && !busy && (
        <div className="text-sm space-y-1 pt-2 border-t">
          <div>✅ Thêm mới: <b>{result.inserted}</b></div>
          <div>🔄 Cập nhật: <b>{result.updated}</b></div>
          <div>⏭ Bỏ qua: <b>{result.skipped}</b> (thiếu mã hoặc tên)</div>
          {result.errors.length > 0 && (
            <details className="text-red-600">
              <summary>Lỗi ({result.errors.length})</summary>
              <ul className="list-disc pl-5">
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </form>
  );
}
