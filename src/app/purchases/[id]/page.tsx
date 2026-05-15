import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";
import { deletePurchase } from "../actions";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const del = deletePurchase.bind(null, order.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Phiếu nhập #{order.id}</h1>
        <div className="flex gap-2">
          <Link href="/purchases" className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100">
            ← Quay lại
          </Link>
          <form action={del}>
            <button
              className="border bg-white text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50"
              type="submit"
            >
              Xóa phiếu
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Info label="Ngày" value={order.ngay.toLocaleString("vi-VN")} />
        <Info label="Nhà cung cấp" value={order.nhaCungCap ?? "—"} />
        <Info label="Phí vận chuyển" value={vnd(order.phiVanChuyen)} />
        <Info label="Tổng tiền" value={vnd(order.tongTien)} />
        {order.ghiChu && (
          <div className="col-span-full">
            <div className="text-neutral-500">Ghi chú</div>
            <div>{order.ghiChu}</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Mã SP</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2 text-right">SL</th>
              <th className="px-3 py-2 text-right">Giá nhập</th>
              <th className="px-3 py-2 text-right">VAT %</th>
              <th className="px-3 py-2 text-right">Giá vốn lô</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="px-3 py-2">{it.product.maSp}</td>
                <td className="px-3 py-2">{it.product.ten}</td>
                <td className="px-3 py-2 text-right">{it.soLuong}</td>
                <td className="px-3 py-2 text-right">{vnd(it.giaNhap)}</td>
                <td className="px-3 py-2 text-right">{Number(it.vat)}</td>
                <td className="px-3 py-2 text-right">{vnd(it.giaVonLo)}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {vnd(Number(it.giaNhap) * it.soLuong * (1 + Number(it.vat) / 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-neutral-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
