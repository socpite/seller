import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  const orders = await prisma.salesOrder.findMany({
    orderBy: { ngay: "desc" },
    include: { items: { include: { product: true } }, payments: true },
  });

  const rows = orders.flatMap((o) =>
    o.items.map((it) => ({
      don_id: o.id,
      ngay: o.ngay.toISOString(),
      khach_hang: o.khachHang ?? "",
      sdt: o.sdt ?? "",
      ma_sp: it.product.maSp,
      ten_sp: it.product.ten,
      so_luong: it.soLuong,
      gia_ban: it.giaBan.toString(),
      gia_von: it.giaVon.toString(),
      vat: it.vat.toString(),
      chiet_khau_dong: it.chietKhau.toString(),
      chiet_khau_don: o.chietKhau.toString(),
      tong_tien_don: o.tongTien.toString(),
      loi_nhuan_don: o.loiNhuan.toString(),
      tien_mat: sumPay(o.payments, "TIEN_MAT"),
      chuyen_khoan: sumPay(o.payments, "CHUYEN_KHOAN"),
      quet_the: sumPay(o.payments, "QUET_THE"),
      ghi_chu: o.ghiChu ?? "",
    }))
  );

  return csvResponse(toCsv(rows), `don-hang-${stamp()}.csv`);
}

function sumPay(ps: { phuongThuc: string; soTien: { toString(): string } }[], pt: string) {
  return ps
    .filter((p) => p.phuongThuc === pt)
    .reduce((s, p) => s + Number(p.soTien), 0)
    .toString();
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}
