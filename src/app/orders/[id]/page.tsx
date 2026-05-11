import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";

const PAYMENT_LABEL: Record<string, string> = {
  TIEN_MAT: "Tiền mặt",
  CHUYEN_KHOAN: "Chuyển khoản",
  QUET_THE: "Quẹt thẻ",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { product: true } },
      payments: true,
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn #{order.id}</h1>
        <Link href="/orders" className="text-sm text-blue-600">← Tất cả đơn</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Info label="Ngày" value={order.ngay.toLocaleString("vi-VN")} />
        <Info label="Khách hàng" value={order.khachHang ?? "—"} />
        <Info label="SĐT" value={order.sdt ?? "—"} />
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Mã SP</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2 text-right">SL</th>
              <th className="px-3 py-2 text-right">Giá bán</th>
              <th className="px-3 py-2 text-right">Giá vốn</th>
              <th className="px-3 py-2 text-right">VAT %</th>
              <th className="px-3 py-2 text-right">CK</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((it) => {
              const line =
                it.soLuong * Number(it.giaBan) * (1 + Number(it.vat) / 100) -
                Number(it.chietKhau);
              return (
                <tr key={it.id}>
                  <td className="px-3 py-2 font-mono">{it.product.maSp}</td>
                  <td className="px-3 py-2">{it.product.ten}</td>
                  <td className="px-3 py-2 text-right">{it.soLuong}</td>
                  <td className="px-3 py-2 text-right">{vnd(it.giaBan)}</td>
                  <td className="px-3 py-2 text-right text-neutral-500">{vnd(it.giaVon)}</td>
                  <td className="px-3 py-2 text-right">{Number(it.vat)}</td>
                  <td className="px-3 py-2 text-right">{vnd(it.chietKhau)}</td>
                  <td className="px-3 py-2 text-right font-medium">{vnd(line)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-1 text-sm">
          <h2 className="font-medium mb-2">Thanh toán</h2>
          {order.payments.length === 0 ? (
            <p className="text-neutral-500">Chưa ghi nhận thanh toán.</p>
          ) : (
            order.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span>{PAYMENT_LABEL[p.phuongThuc]} {p.maGiaoDich ? `(${p.maGiaoDich})` : ""}</span>
                <span>{vnd(p.soTien)}</span>
              </div>
            ))
          )}
        </div>
        <div className="bg-white border rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Chiết khấu đơn</span>
            <span>{vnd(order.chietKhau)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Tổng tiền</span>
            <span>{vnd(order.tongTien)}</span>
          </div>
          <div className={`flex justify-between ${Number(order.loiNhuan) < 0 ? "text-red-600" : "text-emerald-600"}`}>
            <span>Lợi nhuận</span>
            <span>{vnd(order.loiNhuan)}</span>
          </div>
        </div>
      </div>

      {order.ghiChu && (
        <div className="bg-white border rounded-lg p-4 text-sm">
          <h2 className="font-medium mb-1">Ghi chú</h2>
          <p>{order.ghiChu}</p>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
