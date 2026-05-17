"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

type SaleItem = { productId: number; soLuong: number; giaBan: number; vat: number; chietKhau: number };

export async function createSale(formData: FormData) {
  const khachHang = str(formData.get("khach_hang")) || null;
  const sdt = str(formData.get("sdt")) || null;
  const nhanVien = str(formData.get("nhan_vien")) || null;
  const chietKhauDon = num(formData.get("chiet_khau"));
  const ghiChu = str(formData.get("ghi_chu")) || null;

  const items = parseItems(formData);
  if (items.length === 0) throw new Error("Phải có ít nhất 1 mặt hàng");

  const payments = parsePayments(formData);

  const orderId = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let giaVonTotal = 0;
    const itemData: (SaleItem & { giaVon: number })[] = [];

    for (const it of items) {
      const product = await tx.product.findUniqueOrThrow({ where: { id: it.productId } });
      if (product.ton < it.soLuong) {
        throw new Error(`SP ${product.maSp} không đủ tồn (còn ${product.ton})`);
      }
      const giaVon = Number(product.giaVon);
      const lineRevenue = it.soLuong * it.giaBan * (1 + it.vat / 100) - it.chietKhau;
      subtotal += lineRevenue;
      giaVonTotal += giaVon * it.soLuong;
      itemData.push({ ...it, giaVon });
    }

    const tongTien = subtotal - chietKhauDon;
    const loiNhuan = tongTien - giaVonTotal;

    const order = await tx.salesOrder.create({
      data: {
        kenh: "offline",
        khachHang,
        sdt,
        nhanVien,
        chietKhau: chietKhauDon,
        tongTien,
        loiNhuan,
        ghiChu,
      },
    });

    for (const it of itemData) {
      await tx.salesItem.create({
        data: {
          orderId: order.id,
          productId: it.productId,
          soLuong: it.soLuong,
          giaBan: it.giaBan,
          giaVon: it.giaVon,
          vat: it.vat,
          chietKhau: it.chietKhau,
        },
      });
      await tx.product.update({
        where: { id: it.productId },
        data: { ton: { decrement: it.soLuong } },
      });
      await tx.stockMovement.create({
        data: {
          productId: it.productId,
          delta: -it.soLuong,
          type: "BAN",
          refId: order.id,
        },
      });
    }

    for (const p of payments) {
      if (p.soTien <= 0) continue;
      await tx.payment.create({
        data: {
          orderId: order.id,
          phuongThuc: p.phuongThuc,
          soTien: p.soTien,
          maGiaoDich: p.maGiaoDich,
        },
      });
    }

    return order.id;
  });

  revalidatePath("/products");
  revalidatePath("/orders");
  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function deleteOrder(id: number) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUniqueOrThrow({
      where: { id },
      include: { items: true, returns: { include: { items: true } } },
    });

    const returnedQty = new Map<number, number>();
    for (const r of order.returns) {
      for (const ri of r.items) {
        returnedQty.set(ri.productId, (returnedQty.get(ri.productId) ?? 0) + ri.soLuong);
      }
    }

    for (const it of order.items) {
      const stillOut = it.soLuong - (returnedQty.get(it.productId) ?? 0);
      if (stillOut > 0) {
        await tx.product.update({
          where: { id: it.productId },
          data: { ton: { increment: stillOut } },
        });
        await tx.stockMovement.create({
          data: {
            productId: it.productId,
            delta: stillOut,
            type: "DIEU_CHINH",
            refId: id,
            ghiChu: `Xóa đơn #${id}`,
          },
        });
      }
    }

    await tx.salesOrder.delete({ where: { id } });
  });

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/returns");
  redirect("/orders");
}

function parseItems(f: FormData): SaleItem[] {
  const productIds = f.getAll("product_id");
  const soLuongs = f.getAll("so_luong");
  const giaBans = f.getAll("gia_ban_item");
  const vats = f.getAll("vat_item");
  const chietKhaus = f.getAll("chiet_khau_item");
  const out: SaleItem[] = [];
  for (let i = 0; i < productIds.length; i++) {
    const productId = Number(productIds[i]);
    const soLuong = num(soLuongs[i]);
    if (!productId || soLuong <= 0) continue;
    out.push({
      productId,
      soLuong,
      giaBan: num(giaBans[i]),
      vat: num(vats[i]),
      chietKhau: num(chietKhaus[i]),
    });
  }
  return out;
}

function parsePayments(f: FormData) {
  return [
    { phuongThuc: "TIEN_MAT" as const, soTien: num(f.get("pay_tien_mat")), maGiaoDich: null },
    {
      phuongThuc: "CHUYEN_KHOAN" as const,
      soTien: num(f.get("pay_chuyen_khoan")),
      maGiaoDich: str(f.get("ma_giao_dich")) || null,
    },
    { phuongThuc: "QUET_THE" as const, soTien: num(f.get("pay_quet_the")), maGiaoDich: null },
  ];
}
