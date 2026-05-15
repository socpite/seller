import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const returns = await prisma.salesReturn.findMany({
    orderBy: { ngay: "desc" },
    include: { items: true, order: true },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Trả hàng</h1>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Đơn gốc</th>
              <th className="px-3 py-2">Khách</th>
              <th className="px-3 py-2 text-right">Số SP</th>
              <th className="px-3 py-2 text-right">Tiền hoàn</th>
              <th className="px-3 py-2">Lý do</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">
                  <Link href={`/returns/${r.id}`} className="text-blue-600 hover:underline">
                    #{r.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.ngay.toLocaleString("vi-VN")}</td>
                <td className="px-3 py-2">
                  <Link href={`/orders/${r.orderId}`} className="text-blue-600 hover:underline">
                    #{r.orderId}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.order.khachHang ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.items.length}</td>
                <td className="px-3 py-2 text-right font-medium">{vnd(r.tongHoan)}</td>
                <td className="px-3 py-2">{r.lyDo ?? "—"}</td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có phiếu trả hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
