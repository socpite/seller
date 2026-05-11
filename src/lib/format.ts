export function vnd(n: number | string | { toString(): string }): string {
  const num = typeof n === "number" ? n : Number(n.toString());
  return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

export function num(v: FormDataEntryValue | null, fallback = 0): number {
  if (v === null) return fallback;
  const s = String(v).replace(/[^\d.-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

export function str(v: FormDataEntryValue | null): string {
  return v === null ? "" : String(v).trim();
}
