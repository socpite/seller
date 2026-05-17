"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Row = Record<string, unknown>;

function pick(r: Row, keys: string[]): string {
  for (const k of keys) {
    for (const rk of Object.keys(r)) {
      if (rk.toLowerCase().includes(k.toLowerCase())) {
        const v = r[rk];
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
    }
  }
  return "";
}

function pickNum(r: Row, keys: string[]): number {
  const s = pick(r, keys);
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function importProducts(formData: FormData): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Chưa chọn file");

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const r of rows) {
    try {
      let maSp = pick(r, ["mã sản phẩm", "ma san pham", "mã sp"]);
      if (!maSp) maSp = pick(r, ["id sản phẩm", "id san pham", "id"]);
      if (!maSp) {
        skipped++;
        continue;
      }
      const ten = pick(r, ["tên sản phẩm", "ten san pham", "tên"]);
      if (!ten) {
        skipped++;
        continue;
      }

      const data = {
        maSp,
        maSpCha: pick(r, ["id sản phẩm cha", "ma sp cha", "sản phẩm cha"]) || null,
        maVach: pick(r, ["mã vạch", "barcode"]) || null,
        ten,
        donVi: pick(r, ["đơn vị", "don vi", "dvt"]) || "Cái",
        anhUrl: pick(r, ["link ảnh", "anh", "image"]) || null,
        danhMuc: pick(r, ["danh mục", "category"]) || null,
        hangTrong: pick(r, ["hãng tròng", "hang trong"]) || null,
        linkWeb: pick(r, ["link trên website", "link website"]) || null,
        giaNhap: pickNum(r, ["giá nhập", "gia nhap"]),
        vatNhap: pickNum(r, ["vat nhập", "vat nhap"]),
        giaBan: pickNum(r, ["giá bán", "gia ban"]),
        vatBan: pickNum(r, ["vat"]),
        giaVon: pickNum(r, ["giá vốn", "gia von"]),
        ton: Math.trunc(pickNum(r, ["tổng tồn", "tong ton", "tồn"])),
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

  revalidatePath("/products");
  return { inserted, updated, skipped, errors };
}
