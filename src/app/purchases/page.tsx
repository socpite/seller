import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { ngay: "desc" },
    include: { items: true },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nhập hàng</h1>
        <div className="flex gap-2">
          <a
            href="/api/export/purchases"
            className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100"
          >
            ⬇ Export CSV
          </a>
          <Link
            href="/purchases/new"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            + Phiếu nhập mới
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Nhà cung cấp</th>
              <th className="px-3 py-2 text-right">Số mặt hàng</th>
              <th className="px-3 py-2 text-right">Phí VC</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2">
                  <Link href={`/purchases/${o.id}`} className="text-blue-600 hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.ngay.toLocaleString("vi-VN")}</td>
                <td className="px-3 py-2">{o.nhaCungCap ?? "—"}</td>
                <td className="px-3 py-2 text-right">{o.items.length}</td>
                <td className="px-3 py-2 text-right">{vnd(o.phiVanChuyen)}</td>
                <td className="px-3 py-2 text-right font-medium">{vnd(o.tongTien)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có phiếu nhập.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
