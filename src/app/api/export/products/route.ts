import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { maSp: "asc" } });
  const rows = products.map((p) => ({
    ma_sp: p.maSp,
    ma_sp_cha: p.maSpCha ?? "",
    ten: p.ten,
    don_vi: p.donVi,
    gia_nhap: p.giaNhap.toString(),
    vat_nhap: p.vatNhap.toString(),
    gia_ban: p.giaBan.toString(),
    vat_ban: p.vatBan.toString(),
    gia_von: p.giaVon.toString(),
    gia_si: p.giaSi.toString(),
    ton: p.ton,
    ghi_chu: p.ghiChu ?? "",
  }));
  return csvResponse(toCsv(rows), `kho-hang-${stamp()}.csv`);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}
