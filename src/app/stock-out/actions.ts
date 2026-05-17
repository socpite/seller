"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

export async function createStockOut(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const soLuong = num(formData.get("so_luong"));
  const lyDo = str(formData.get("ly_do")) || null;

  if (!productId || soLuong <= 0) throw new Error("Vui lòng chọn sản phẩm và số lượng hợp lệ");

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { ton: { decrement: soLuong } },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        delta: -soLuong,
        type: "XUAT_HUY",
        ghiChu: lyDo,
      },
    }),
  ]);

  revalidatePath("/stock-out");
  revalidatePath("/products");
  redirect("/stock-out");
}
