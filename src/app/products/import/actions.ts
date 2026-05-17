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

  for (const r of rows) {
    try {
      let maSp = pick(r, ["Mã sản phẩm"]);
      if (!maSp) maSp = pick(r, ["ID sản phẩm"]);
      if (!maSp) {
        skipped++;
        continue;
      }
      const ten = pick(r, ["Tên sản phẩm"]);
      if (!ten) {
        skipped++;
        continue;
      }

      const data = {
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
      };

      const existing = await prisma.product.findUnique({ where: { maSp } });
      if (existing) {
        await prisma.product.update({ where: { maSp }, data });
        updated++;
      } else {
        await prisma.product.create({ data });
        inserted++;
      }
    } catch (e) {
      errors.push(`Dòng ${JSON.stringify(r).slice(0, 100)}: ${(e as Error).message}`);
    }
  }

  return { inserted, updated, skipped, errors };
}

export async function refreshProducts() {
  await requireAdmin();
  revalidatePath("/products");
}
