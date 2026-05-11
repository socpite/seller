import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { ngay: "desc" },
    include: { items: { include: { product: true } } },
  });

  const rows = orders.flatMap((o) =>
    o.items.map((it) => ({
      phieu_id: o.id,
      ngay: o.ngay.toISOString(),
      nha_cung_cap: o.nhaCungCap ?? "",
      ma_sp: it.product.maSp,
      ten_sp: it.product.ten,
      so_luong: it.soLuong,
      gia_nhap: it.giaNhap.toString(),
      vat: it.vat.toString(),
      gia_von_lo: it.giaVonLo.toString(),
      phi_van_chuyen_phieu: o.phiVanChuyen.toString(),
      tong_tien_phieu: o.tongTien.toString(),
      ghi_chu: o.ghiChu ?? "",
    }))
  );

  return csvResponse(toCsv(rows), `nhap-hang-${stamp()}.csv`);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}
