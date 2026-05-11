"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";

type ItemInput = { productId: number; soLuong: number; giaNhap: number; vat: number };

export async function createPurchase(formData: FormData) {
  const nhaCungCap = str(formData.get("nha_cung_cap")) || null;
  const phiVanChuyen = num(formData.get("phi_van_chuyen"));
  const ghiChu = str(formData.get("ghi_chu")) || null;

  const items = parseItems(formData);
  if (items.length === 0) throw new Error("Phải có ít nhất 1 mặt hàng");

  const subtotal = items.reduce((s, i) => s + i.soLuong * i.giaNhap * (1 + i.vat / 100), 0);
  const tongTien = subtotal + phiVanChuyen;
  const totalUnits = items.reduce((s, i) => s + i.soLuong, 0) || 1;
  const shipPerUnit = phiVanChuyen / totalUnits;

  await prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.create({
      data: { nhaCungCap, phiVanChuyen, tongTien, ghiChu },
    });

    for (const it of items) {
      const giaVonLo = it.giaNhap * (1 + it.vat / 100) + shipPerUnit;
      await tx.purchaseItem.create({
        data: {
          orderId: order.id,
          productId: it.productId,
          soLuong: it.soLuong,
          giaNhap: it.giaNhap,
          vat: it.vat,
          giaVonLo,
        },
      });

      const product = await tx.product.findUniqueOrThrow({
        where: { id: it.productId },
      });
      const oldQty = product.ton;
      const oldVon = Number(product.giaVon);
      const newQty = oldQty + it.soLuong;
      const newVon =
        newQty > 0
          ? (oldVon * Math.max(oldQty, 0) + giaVonLo * it.soLuong) / newQty
          : giaVonLo;

      await tx.product.update({
        where: { id: it.productId },
        data: {
          ton: newQty,
          giaVon: newVon,
          giaNhap: it.giaNhap,
          vatNhap: it.vat,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: it.productId,
          delta: it.soLuong,
          type: "NHAP",
          refId: order.id,
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  redirect("/purchases");
}

function parseItems(f: FormData): ItemInput[] {
  const productIds = f.getAll("product_id");
  const soLuongs = f.getAll("so_luong");
  const giaNhaps = f.getAll("gia_nhap_item");
  const vats = f.getAll("vat_item");
  const out: ItemInput[] = [];
  for (let i = 0; i < productIds.length; i++) {
    const productId = Number(productIds[i]);
    const soLuong = num(soLuongs[i]);
    if (!productId || soLuong <= 0) continue;
    out.push({
      productId,
      soLuong,
      giaNhap: num(giaNhaps[i]),
      vat: num(vats[i]),
    });
  }
  return out;
}
