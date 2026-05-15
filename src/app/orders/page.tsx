import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.salesOrder.findMany({
    orderBy: { ngay: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bán hàng</h1>
        <div className="flex gap-2">
          <a
            href="/api/export/orders"
            className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100"
          >
            ⬇ Export CSV
          </a>
          <Link
            href="/orders/new"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            + Phiếu bán mới
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Khách</th>
              <th className="px-3 py-2">NV bán</th>
              <th className="px-3 py-2 text-right">Số SP</th>
              <th className="px-3 py-2 text-right">Giảm</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-right">Lợi nhuận</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => {
              const itemCk = o.items.reduce((s, it) => s + Number(it.chietKhau), 0);
              const totalCk = itemCk + Number(o.chietKhau);
              const gross = Number(o.tongTien) + totalCk;
              const ckPct = gross > 0 ? (totalCk / gross) * 100 : 0;
              return (
              <tr key={o.id}>
                <td className="px-3 py-2">
                  <Link href={`/orders/${o.id}`} className="text-blue-600 hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.ngay.toLocaleString("vi-VN")}</td>
                <td className="px-3 py-2">{o.khachHang ?? "—"}</td>
                <td className="px-3 py-2">{o.nhanVien ?? "—"}</td>
                <td className="px-3 py-2 text-right">{o.items.length}</td>
                <td className="px-3 py-2 text-right">{ckPct > 0 ? `${ckPct.toFixed(1)}%` : "—"}</td>
                <td className="px-3 py-2 text-right font-medium">{vnd(o.tongTien)}</td>
                <td className={`px-3 py-2 text-right ${Number(o.loiNhuan) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {vnd(o.loiNhuan)}
                </td>
              </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có đơn hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
