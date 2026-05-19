import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [productCount, lowStock, todayOrders] = await Promise.all([
    prisma.product.count({ where: { archived: false } }),
    prisma.product.findMany({
      where: { archived: false, ton: { lte: 3 } },
      orderBy: { ton: "asc" },
      take: 10,
    }),
    prisma.salesOrder.findMany({
      where: { ngay: { gte: startOfToday() } },
      orderBy: { ngay: "desc" },
      include: { items: true },
    }),
  ]);

  const doanhThu = todayOrders.reduce((s, o) => s + Number(o.tongTien), 0);
  const loiNhuan = todayOrders.reduce((s, o) => s + Number(o.loiNhuan), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Số mặt hàng" value={productCount.toString()} />
        <Card label="Đơn hôm nay" value={todayOrders.length.toString()} />
        <Card label="Doanh thu hôm nay" value={vnd(doanhThu)} />
        <Card label="Lợi nhuận hôm nay" value={vnd(loiNhuan)} />
      </div>

      <section className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Sản phẩm sắp hết</h2>
          <Link href="/products" className="text-sm text-blue-600">Quản lý kho →</Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-neutral-500">Chưa có cảnh báo.</p>
        ) : (
          <ul className="divide-y">
            {lowStock.map((p) => (
              <li key={p.id} className="py-2 flex justify-between text-sm">
                <span><span className="font-mono">{p.maSp}</span> — {p.ten}</span>
                <span className={p.ton <= 0 ? "text-red-600" : "text-amber-600"}>
                  Tồn: {p.ton}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
