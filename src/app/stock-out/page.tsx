import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StockOutPage() {
  const movements = await prisma.stockMovement.findMany({
    where: { type: "XUAT_HUY" },
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Xuất hủy</h1>
        <Link
          href="/stock-out/new"
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          + Phiếu xuất hủy
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Mã SP</th>
              <th className="px-3 py-2">Tên sản phẩm</th>
              <th className="px-3 py-2 text-right">Số lượng</th>
              <th className="px-3 py-2">Lý do</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movements.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2">{m.createdAt.toLocaleString("vi-VN")}</td>
                <td className="px-3 py-2">{m.product.maSp}</td>
                <td className="px-3 py-2">{m.product.ten}</td>
                <td className="px-3 py-2 text-right text-red-600 font-medium">{m.delta}</td>
                <td className="px-3 py-2">{m.ghiChu ?? "—"}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có phiếu xuất hủy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
