"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Row = Record<string, unknown>;

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function pick(r: Row, names: string[]): string {
  const map = new Map<string, unknown>();
  for (const k of Object.keys(r)) map.set(norm(k), r[k]);
  for (const n of names) {
    const v = map.get(norm(n));
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function pickNum(r: Row, names: string[]): number {
  const s = pick(r, names);
  if (!s) return 0;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function importProductsBatch(rows: Row[]): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  await requireAdmin();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  type Prepared = { maSp: string; data: Record<string, unknown>; raw: Row };
  const prepared: Prepared[] = [];

  for (const r of rows) {
    let maSp = pick(r, ["Mã sản phẩm"]);
    if (!maSp) maSp = pick(r, ["ID sản phẩm"]);
    if (!maSp) maSp = `AUTO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const ten = pick(r, ["Tên sản phẩm"]);
    if (!ten) { skipped++; continue; }

    prepared.push({
      maSp,
      raw: r,
      data: {
        maSp,
        maSpCha: pick(r, ["Id sản phẩm cha"]) || null,
        maVach: pick(r, ["Mã vạch"]) || null,
        ten,
        donVi: pick(r, ["Đơn vị tính"]) || "Cái",
        anhUrl: pick(r, ["Link ảnh sản phẩm"]) || null,
        danhMuc: pick(r, ["Danh mục"]) || null,
        hangTrong: pick(r, ["Hãng tròng"]) || null,
        linkWeb: pick(r, ["Link trên website"]) || null,
        giaNhap: pickNum(r, ["Giá nhập"]),
        vatNhap: pickNum(r, ["VAT nhập"]),
        giaBan: pickNum(r, ["Giá bán"]),
        vatBan: pickNum(r, ["VAT"]),
        giaVon: pickNum(r, ["Giá vốn"]),
        ton: Math.trunc(pickNum(r, ["Tổng tồn", "Có thể bán"])),
        archived: false,
      },
    });
  }

  const existing = prepared.length
    ? await prisma.product.findMany({
        where: { maSp: { in: prepared.map((p) => p.maSp) } },
        select: { maSp: true },
      })
    : [];
  const existingSet = new Set(existing.map((e) => e.maSp));

  await Promise.all(
    prepared.map(async (p) => {
      try {
        await prisma.product.upsert({
          where: { maSp: p.maSp },
          create: p.data as never,
          update: p.data as never,
        });
        if (existingSet.has(p.maSp)) updated++;
        else inserted++;
      } catch (e) {
        errors.push(`${p.maSp}: ${(e as Error).message}`);
      }
    }),
  );

  return { inserted, updated, skipped, errors };
}

export async function refreshProducts() {
  await requireAdmin();
  revalidatePath("/products");
}
