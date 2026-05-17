import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { vnd } from "@/lib/format";
import { adjustStock, deleteProduct } from "./actions";
import { getRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const isAdmin = (await getRole()) === "admin";
  const products = await prisma.product.findMany({
    where: {
      archived: false,
      ...(q
        ? {
            OR: [
              { maSp: { contains: q, mode: "insensitive" } },
              { ten: { contains: q, mode: "insensitive" } },
              { maSpCha: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kho hàng</h1>
        <div className="flex gap-2">
          <a
            href="/api/export/products"
            className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100"
          >
            ⬇ Export CSV
          </a>
          {isAdmin && (
            <Link
              href="/products/import"
              className="border bg-white px-3 py-1.5 rounded text-sm hover:bg-neutral-100"
            >
              ⬆ Import XLSX
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/products/new"
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
            >
              + Thêm sản phẩm
            </Link>
          )}
        </div>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Tìm theo mã SP, tên, mã cha..."
          className="border rounded px-3 py-1.5 text-sm w-80"
        />
        <button className="border px-3 py-1.5 rounded text-sm bg-white hover:bg-neutral-100">
          Tìm
        </button>
      </form>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Mã SP</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2 text-right">Giá vốn</th>
              <th className="px-3 py-2 text-right">Giá bán</th>
              <th className="px-3 py-2 text-right">Tồn</th>
              <th className="px-3 py-2">Điều chỉnh</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 font-mono">{p.maSp}</td>
                <td className="px-3 py-2">
                  <Link href={`/products/${p.id}/edit`} className="hover:text-blue-600">
                    {p.ten}
                  </Link>
                  {p.maSpCha && (
                    <span className="ml-2 text-xs text-neutral-500">({p.maSpCha})</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">{vnd(p.giaVon)}</td>
                <td className="px-3 py-2 text-right">{vnd(p.giaBan)}</td>
                <td className={`px-3 py-2 text-right font-medium ${p.ton <= 0 ? "text-red-600" : p.ton <= 3 ? "text-amber-600" : ""}`}>
                  {p.ton}
                </td>
                <td className="px-3 py-2">
                  {isAdmin && (
                    <form action={adjustStock.bind(null, p.id)} className="flex gap-1">
                      <input
                        name="delta"
                        type="number"
                        placeholder="±"
                        className="border rounded px-2 py-0.5 w-16 text-sm"
                      />
                      <input
                        name="ghi_chu"
                        placeholder="lý do"
                        className="border rounded px-2 py-0.5 w-24 text-sm"
                      />
                      <button className="text-xs px-2 py-0.5 bg-neutral-100 border rounded hover:bg-neutral-200">
                        OK
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isAdmin && (
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button className="text-xs text-red-600 hover:underline">Xoá</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
