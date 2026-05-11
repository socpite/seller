"use client";

import { useMemo, useState } from "react";

type Product = { id: number; maSp: string; ten: string; giaNhap: number; vatNhap: number };

type Row = { key: number; productId: number | ""; soLuong: number; giaNhap: number; vat: number };

let counter = 0;
const newRow = (): Row => ({ key: ++counter, productId: "", soLuong: 1, giaNhap: 0, vat: 0 });

export function PurchaseForm({
  action,
  products,
}: {
  action: (formData: FormData) => void;
  products: Product[];
}) {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [phiVC, setPhiVC] = useState(0);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const total = useMemo(
    () =>
      rows.reduce((s, r) => {
        const p = typeof r.productId === "number" ? productMap.get(r.productId) : undefined;
        if (!p) return s;
        return s + r.soLuong * r.giaNhap * (1 + r.vat / 100);
      }, 0) + phiVC,
    [rows, phiVC, productMap]
  );

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function removeRow(key: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));
  }
  function onProductChange(key: number, productId: number) {
    const p = productMap.get(productId);
    updateRow(key, {
      productId,
      giaNhap: p?.giaNhap ?? 0,
      vat: p?.vatNhap ?? 0,
    });
  }

  return (
    <form action={action} className="space-y-4">
      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="text-sm">
          <span className="text-neutral-700">Nhà cung cấp</span>
          <input name="nha_cung_cap" className="w-full border rounded px-3 py-1.5 mt-1 text-sm" />
        </label>
        <label className="text-sm">
          <span className="text-neutral-700">Phí vận chuyển</span>
          <input
            name="phi_van_chuyen"
            type="number"
            min={0}
            value={phiVC}
            onChange={(e) => setPhiVC(Number(e.target.value) || 0)}
            className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-1">
          <span className="text-neutral-700">Ghi chú</span>
          <input name="ghi_chu" className="w-full border rounded px-3 py-1.5 mt-1 text-sm" />
        </label>
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2 w-1/3">Sản phẩm</th>
              <th className="px-3 py-2">Số lượng</th>
              <th className="px-3 py-2">Giá nhập</th>
              <th className="px-3 py-2">VAT %</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const p = typeof r.productId === "number" ? productMap.get(r.productId) : undefined;
              const lineTotal = p ? r.soLuong * r.giaNhap * (1 + r.vat / 100) : 0;
              return (
                <tr key={r.key}>
                  <td className="px-3 py-2">
                    <select
                      name="product_id"
                      value={r.productId}
                      onChange={(e) => onProductChange(r.key, Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                      required
                    >
                      <option value="">— Chọn sản phẩm —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.maSp} — {p.ten}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="so_luong"
                      type="number"
                      min={1}
                      value={r.soLuong}
                      onChange={(e) => updateRow(r.key, { soLuong: Number(e.target.value) || 0 })}
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="gia_nhap_item"
                      type="number"
                      min={0}
                      value={r.giaNhap}
                      onChange={(e) => updateRow(r.key, { giaNhap: Number(e.target.value) || 0 })}
                      className="w-28 border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="vat_item"
                      type="number"
                      min={0}
                      value={r.vat}
                      onChange={(e) => updateRow(r.key, { vat: Number(e.target.value) || 0 })}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {lineTotal.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 flex justify-between items-center border-t">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow()])}
            className="text-sm text-blue-600 hover:underline"
          >
            + Thêm dòng
          </button>
          <div className="text-base font-semibold">
            Tổng cộng: {total.toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Lưu phiếu nhập
      </button>
    </form>
  );
}
