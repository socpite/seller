import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sửa sản phẩm</h1>
      <ProductForm
        action={action}
        submitLabel="Cập nhật"
        values={{
          maSp: product.maSp,
          maSpCha: product.maSpCha,
          maVach: product.maVach,
          ten: product.ten,
          donVi: product.donVi,
          anhUrl: product.anhUrl,
          danhMuc: product.danhMuc,
          hangTrong: product.hangTrong,
          linkWeb: product.linkWeb,
          giaNhap: product.giaNhap.toString(),
          vatNhap: product.vatNhap.toString(),
          giaBan: product.giaBan.toString(),
          vatBan: product.vatBan.toString(),
          giaVon: product.giaVon.toString(),
          giaSi: product.giaSi.toString(),
          ghiChu: product.ghiChu,
        }}
      />
    </div>
  );
}
