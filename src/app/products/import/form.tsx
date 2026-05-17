"use client";

import { useState } from "react";
import { importProducts } from "./actions";

export function ImportForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const r = await importProducts(formData);
      setResult(r);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={onSubmit} className="bg-white border rounded-lg p-4 space-y-3">
      <input
        type="file"
        name="file"
        accept=".xlsx,.xls"
        required
        className="block text-sm w-full border rounded px-3 py-2 bg-white file:mr-3 file:border-0 file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded file:cursor-pointer hover:file:bg-blue-700"
      />
      <button
        disabled={busy}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Đang import..." : "Bắt đầu import"}
      </button>

      {err && <div className="text-sm text-red-600">Lỗi: {err}</div>}

      {result && (
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
