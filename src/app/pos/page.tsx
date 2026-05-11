import { prisma } from "@/lib/prisma";
import { createSale } from "./actions";
import { PosForm } from "./form";

export const dynamic = "force-dynamic";

export default async function PosPage() {
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
      <h1 className="text-2xl font-semibold">Bán hàng (offline)</h1>
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
