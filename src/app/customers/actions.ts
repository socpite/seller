"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { num, str } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

function parse(f: FormData) {
  return {
    sdt: str(f.get("sdt")).trim(),
    ten: str(f.get("ten")).trim(),
    diaChi: str(f.get("dia_chi")) || null,
    chietKhauPct: num(f.get("chiet_khau_pct")),
    ghiChu: str(f.get("ghi_chu")) || null,
  };
}

export async function createCustomer(formData: FormData) {
  const data = parse(formData);
  if (!data.sdt || !data.ten) throw new Error("SDT và tên là bắt buộc");
  await prisma.customer.create({ data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: number, formData: FormData) {
  const data = parse(formData);
  await prisma.customer.update({ where: { id }, data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: number) {
  await requireAdmin();
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}

export async function lookupCustomer(sdt: string) {
  if (!sdt) return null;
  const c = await prisma.customer.findUnique({ where: { sdt } });
  if (!c) return null;
  return {
    id: c.id,
    sdt: c.sdt,
    ten: c.ten,
    chietKhauPct: Number(c.chietKhauPct),
  };
}
