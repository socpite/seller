import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";
import { createReturn } from "@/app/returns/actions";

export const dynamic = "force-dynamic";

export default async function ReturnFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      returns: { include: { items: true } },
    },
  });
  if (!order) notFound();

  const returnedQty = new Map<number, number>();
  for (const r of order.returns) {
    for (const ri of r.items) {
      returnedQty.set(ri.productId, (returnedQty.get(ri.productId) ?? 0) + ri.soLuong);
    }
  }

  const rows = order.items.map((it) => {
    const already = returnedQty.get(it.productId) ?? 0;
    const remaining = it.soLuong - already;
    const unitNet =
      it.soLuong > 0
        ? (Number(it.giaBan) * (1 + Number(it.vat) / 100) * it.soLuong - Number(it.chietKhau)) /
          it.soLuong
        : Number(it.giaBan);
    return { it, already, remaining, unitNet };
  });

  const action = createReturn.bind(null, orderId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trả hàng — đơn #{order.id}</h1>
        <Link href={`/orders/${order.id}`} className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100">
          ← Quay lại đơn
        </Link>
      </div>

      <form action={action} className="space-y-4">
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-3 py-2">Mã SP</th>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2 text-right">Đã bán</th>
                <th className="px-3 py-2 text-right">Đã trả</th>
                <th className="px-3 py-2 text-right">Còn lại</th>
                <th className="px-3 py-2 text-right">Đơn giá hoàn</th>
                <th className="px-3 py-2 text-right w-32">SL trả</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(({ it, already, remaining, unitNet }) => (
                <tr key={it.id}>
                  <td className="px-3 py-2 font-mono">{it.product.maSp}</td>
                  <td className="px-3 py-2">{it.product.ten}</td>
                  <td className="px-3 py-2 text-right">{it.soLuong}</td>
                  <td className="px-3 py-2 text-right">{already}</td>
                  <td className="px-3 py-2 text-right font-medium">{remaining}</td>
                  <td className="px-3 py-2 text-right">{vnd(unitNet)}</td>
                  <td className="px-3 py-2 text-right">
                    <input type="hidden" name="item_id" value={it.id} />
                    <input
                      name="qty"
                      type="number"
                      min={0}
                      max={remaining}
                      defaultValue={0}
                      disabled={remaining <= 0}
                      className="w-20 border rounded px-2 py-1 text-sm text-right disabled:bg-neutral-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3 max-w-2xl">
          <label className="block text-sm">
            <span className="text-neutral-700">Lý do trả</span>
            <input
              name="ly_do"
              placeholder="VD: lỗi sản phẩm, khách đổi ý..."
              className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-neutral-700">Ghi chú</span>
            <textarea
              name="ghi_chu"
              rows={2}
              className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
            />
          </label>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Xác nhận trả hàng
          </button>
        </div>
      </form>
    </div>
  );
}
