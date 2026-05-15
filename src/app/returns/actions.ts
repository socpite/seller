"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";

export async function createReturn(orderId: number, formData: FormData) {
  const lyDo = str(formData.get("ly_do")) || null;
  const ghiChu = str(formData.get("ghi_chu")) || null;

  const itemIds = formData.getAll("item_id");
  const qtys = formData.getAll("qty");

  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, returns: { include: { items: true } } },
  });

  const returnedSoFar = new Map<number, number>();
  for (const r of order.returns) {
    for (const ri of r.items) {
      returnedSoFar.set(ri.productId, (returnedSoFar.get(ri.productId) ?? 0) + ri.soLuong);
    }
  }

  type Picked = { itemId: number; productId: number; soLuong: number; giaBan: number; giaVon: number };
  const picked: Picked[] = [];

  for (let i = 0; i < itemIds.length; i++) {
    const itemId = Number(itemIds[i]);
    const qty = num(qtys[i]);
    if (!itemId || qty <= 0) continue;
    const it = order.items.find((x) => x.id === itemId);
    if (!it) continue;
    const already = returnedSoFar.get(it.productId) ?? 0;
    const remaining = it.soLuong - already;
    if (qty > remaining) {
      throw new Error(`SP #${it.productId}: chỉ còn ${remaining} có thể trả`);
    }
    const unitPriceNet =
      it.soLuong > 0
        ? (Number(it.giaBan) * (1 + Number(it.vat) / 100) * it.soLuong - Number(it.chietKhau)) /
          it.soLuong
        : Number(it.giaBan);
    picked.push({
      itemId,
      productId: it.productId,
      soLuong: qty,
      giaBan: unitPriceNet,
      giaVon: Number(it.giaVon),
    });
  }

  if (picked.length === 0) throw new Error("Phải chọn ít nhất 1 mặt hàng để trả");

  const tongHoan = picked.reduce((s, p) => s + p.soLuong * p.giaBan, 0);

  const returnId = await prisma.$transaction(async (tx) => {
    const ret = await tx.salesReturn.create({
      data: { orderId, lyDo, ghiChu, tongHoan },
    });
    for (const p of picked) {
      await tx.salesReturnItem.create({
        data: {
          returnId: ret.id,
          productId: p.productId,
          soLuong: p.soLuong,
          giaBan: p.giaBan,
          giaVon: p.giaVon,
        },
      });
      await tx.product.update({
        where: { id: p.productId },
        data: { ton: { increment: p.soLuong } },
      });
      await tx.stockMovement.create({
        data: {
          productId: p.productId,
          delta: p.soLuong,
          type: "HANG_TRA",
          refId: ret.id,
          ghiChu: `Trả từ đơn #${orderId}`,
        },
      });
    }
    const loiNhuanGiam = picked.reduce((s, p) => s + p.soLuong * (p.giaBan - p.giaVon), 0);
    await tx.salesOrder.update({
      where: { id: orderId },
      data: { loiNhuan: { decrement: loiNhuanGiam } },
    });
    return ret.id;
  });

  revalidatePath("/returns");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  redirect(`/returns/${returnId}`);
}
