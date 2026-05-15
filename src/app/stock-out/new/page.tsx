import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createStockOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewStockOutPage() {
  const products = await prisma.product.findMany({
    orderBy: { maSp: "asc" },
    select: { id: true, maSp: true, ten: true, ton: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Phiếu xuất hủy mới</h1>
        <Link href="/stock-out" className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100">
          ← Quay lại
        </Link>
      </div>

      <form action={createStockOut} className="space-y-4 bg-white border rounded-lg p-6 max-w-2xl">
        <label className="block text-sm">
          <span className="text-neutral-700">Sản phẩm *</span>
          <select
            name="product_id"
            required
            className="w-full border rounded px-3 py-1.5 mt-1 text-sm bg-white"
            defaultValue=""
          >
            <option value="" disabled>— Chọn sản phẩm —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.maSp} — {p.ten} (tồn: {p.ton})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-neutral-700">Số lượng *</span>
          <input
            name="so_luong"
            type="number"
            min={1}
            required
            className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-700">Lý do</span>
          <textarea
            name="ly_do"
            rows={2}
            placeholder="VD: hàng hỏng, trầy xước, hết hạn..."
            className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
          />
        </label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Xác nhận xuất hủy
        </button>
      </form>
    </div>
  );
}
