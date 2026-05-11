import { prisma } from "@/lib/prisma";
import { createPurchase } from "../actions";
import { PurchaseForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const products = await prisma.product.findMany({
    orderBy: { maSp: "asc" },
    select: { id: true, maSp: true, ten: true, giaNhap: true, vatNhap: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Phiếu nhập mới</h1>
      <PurchaseForm
        action={createPurchase}
        products={products.map((p) => ({
          id: p.id,
          maSp: p.maSp,
          ten: p.ten,
          giaNhap: Number(p.giaNhap),
          vatNhap: Number(p.vatNhap),
        }))}
      />
    </div>
  );
}
