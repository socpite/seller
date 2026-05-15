import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.salesReturn.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: true } }, order: true },
  });
  if (!r) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Phiếu trả #{r.id}</h1>
        <Link href="/returns" className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100">
          ← Quay lại
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Info label="Ngày" value={r.ngay.toLocaleString("vi-VN")} />
        <Info
          label="Đơn gốc"
          value={
            <Link href={`/orders/${r.orderId}`} className="text-blue-600 hover:underline">
              #{r.orderId}
            </Link>
          }
        />
        <Info label="Khách" value={r.order.khachHang ?? "—"} />
        <Info label="Tiền hoàn" value={vnd(r.tongHoan)} />
        {r.lyDo && (
          <div className="col-span-full">
            <div className="text-neutral-500">Lý do</div>
            <div>{r.lyDo}</div>
          </div>
        )}
        {r.ghiChu && (
          <div className="col-span-full">
            <div className="text-neutral-500">Ghi chú</div>
            <div>{r.ghiChu}</div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Mã SP</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2 text-right">SL trả</th>
              <th className="px-3 py-2 text-right">Đơn giá hoàn</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {r.items.map((it) => (
              <tr key={it.id}>
                <td className="px-3 py-2">{it.product.maSp}</td>
                <td className="px-3 py-2">{it.product.ten}</td>
                <td className="px-3 py-2 text-right">{it.soLuong}</td>
                <td className="px-3 py-2 text-right">{vnd(it.giaBan)}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {vnd(Number(it.giaBan) * it.soLuong)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-neutral-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
