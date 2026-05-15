import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSale } from "../actions";
import { PosForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const products = await prisma.product.findMany({
    orderBy: { maSp: "asc" },
    select: {
      id: true,
      maSp: true,
      ten: true,
      giaBan: true,
      vatBan: true,
      ton: true,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Phiếu bán mới</h1>
        <Link href="/orders" className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100">
          ← Quay lại
        </Link>
      </div>
      <PosForm
        action={createSale}
        products={products.map((p) => ({
          id: p.id,
          maSp: p.maSp,
          ten: p.ten,
          giaBan: Number(p.giaBan),
          vatBan: Number(p.vatBan),
          ton: p.ton,
        }))}
      />
    </div>
  );
}
