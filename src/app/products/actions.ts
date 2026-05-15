"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";

export async function createProduct(formData: FormData) {
  const data = parseForm(formData);
  if (!data.maSp || !data.ten) throw new Error("Mã SP và tên là bắt buộc");
  await prisma.product.create({ data });
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const data = parseForm(formData);
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/products");
  redirect("/products");
}

export async function adjustStock(productId: number, formData: FormData) {
  const delta = num(formData.get("delta"));
  const ghiChu = str(formData.get("ghi_chu")) || null;
  if (delta === 0) return;
  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { ton: { increment: delta } },
    }),
    prisma.stockMovement.create({
      data: { productId, delta, type: "DIEU_CHINH", ghiChu },
    }),
  ]);
  revalidatePath("/products");
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
}

function parseForm(f: FormData) {
  return {
    maSp: str(f.get("ma_sp")),
    maSpCha: str(f.get("ma_sp_cha")) || null,
    maVach: str(f.get("ma_vach")) || null,
    ten: str(f.get("ten")),
    donVi: str(f.get("don_vi")) || "Cái",
    anhUrl: str(f.get("anh_url")) || null,
    danhMuc: str(f.get("danh_muc")) || null,
    hangTrong: str(f.get("hang_trong")) || null,
    linkWeb: str(f.get("link_web")) || null,
    giaNhap: num(f.get("gia_nhap")),
    vatNhap: num(f.get("vat_nhap")),
    giaBan: num(f.get("gia_ban")),
    vatBan: num(f.get("vat_ban")),
    giaVon: num(f.get("gia_von")),
    giaSi: num(f.get("gia_si")),
    ghiChu: str(f.get("ghi_chu")) || null,
  };
}
