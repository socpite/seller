import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";
import { deleteCustomer } from "./actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { updatedAt: "desc" } });
  const sdts = customers.map((c) => c.sdt);

  const stats = sdts.length
    ? await prisma.salesOrder.groupBy({
        by: ["sdt"],
        where: { sdt: { in: sdts } },
        _sum: { tongTien: true },
        _count: { _all: true },
      })
    : [];
  const statsMap = new Map(
    stats.map((s) => [s.sdt!, { total: Number(s._sum.tongTien ?? 0), count: s._count._all }]),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Khách hàng</h1>
        <Link
          href="/customers/new"
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          + Thêm khách
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">SDT</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Địa chỉ</th>
              <th className="px-3 py-2 text-right">CK mặc định</th>
              <th className="px-3 py-2 text-right">Số lần mua</th>
              <th className="px-3 py-2 text-right">Tổng tiền mua</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => {
              const s = statsMap.get(c.sdt);
              return (
                <tr key={c.id}>
                  <td className="px-3 py-2 font-mono">{c.sdt}</td>
                  <td className="px-3 py-2">
                    <Link href={`/customers/${c.id}/edit`} className="hover:text-blue-600">
                      {c.ten}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{c.diaChi ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{Number(c.chietKhauPct)}%</td>
                  <td className="px-3 py-2 text-right">{s?.count ?? 0}</td>
                  <td className="px-3 py-2 text-right font-medium">{vnd(s?.total ?? 0)}</td>
                  <td className="px-3 py-2">
                    <form action={deleteCustomer.bind(null, c.id)}>
                      <button className="text-xs text-red-600 hover:underline">Xoá</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có khách hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
