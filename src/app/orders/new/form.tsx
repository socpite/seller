"use client";

import { useMemo, useState } from "react";
import { lookupCustomer } from "@/app/customers/actions";

type Product = {
  id: number;
  maSp: string;
  ten: string;
  giaBan: number;
  vatBan: number;
  ton: number;
};

type Row = {
  key: number;
  productId: number | "";
  soLuong: number;
  giaBan: number;
  vat: number;
  chietKhauPct: number;
};

let counter = 0;
const newRow = (): Row => ({
  key: ++counter,
  productId: "",
  soLuong: 1,
  giaBan: 0,
  vat: 0,
  chietKhauPct: 0,
});

function lineGross(r: Row) {
  return r.soLuong * r.giaBan * (1 + r.vat / 100);
}
function lineCk(r: Row) {
  return (lineGross(r) * r.chietKhauPct) / 100;
}
function lineNet(r: Row) {
  return lineGross(r) - lineCk(r);
}

export function PosForm({
  action,
  products,
}: {
  action: (formData: FormData) => void;
  products: Product[];
}) {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [chietKhauDonPct, setChietKhauDonPct] = useState(0);
  const [chietKhauDonTien, setChietKhauDonTien] = useState(0);
  const [sdt, setSdt] = useState("");
  const [khachHang, setKhachHang] = useState("");
  const [customerHit, setCustomerHit] = useState<string | null>(null);

  async function onSdtBlur() {
    const s = sdt.trim();
    if (!s) {
      setCustomerHit(null);
      return;
    }
    const c = await lookupCustomer(s);
    if (c) {
      if (!khachHang) setKhachHang(c.ten);
      setChietKhauDonPct(c.chietKhauPct);
      setCustomerHit(`${c.ten} · CK ${c.chietKhauPct}%`);
    } else {
      setChietKhauDonPct(0);
      setCustomerHit("Khách mới");
    }
  }
  const [tienMat, setTienMat] = useState(0);
  const [chuyenKhoan, setChuyenKhoan] = useState(0);
  const [quetThe, setQuetThe] = useState(0);
  const [search, setSearch] = useState("");

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products.slice(0, 20);
    return products
      .filter((p) => p.maSp.toLowerCase().includes(s) || p.ten.toLowerCase().includes(s))
      .slice(0, 20);
  }, [search, products]);

  const subtotal = useMemo(
    () =>
      rows.reduce((s, r) => {
        const p = typeof r.productId === "number" ? productMap.get(r.productId) : undefined;
        if (!p) return s;
        return s + lineNet(r);
      }, 0),
    [rows, productMap],
  );
  const chietKhauDon = (subtotal * chietKhauDonPct) / 100 + chietKhauDonTien;
  const tongTien = Math.max(0, subtotal - chietKhauDon);
  const daThanhToan = tienMat + chuyenKhoan + quetThe;
  const conLai = tongTien - daThanhToan;

  function addProduct(p: Product) {
    const fresh = newRow();
    setRows((rs) => {
      const empty = rs.find((r) => r.productId === "");
      const r: Row = { ...fresh, productId: p.id, giaBan: p.giaBan, vat: p.vatBan };
      if (empty) return rs.map((x) => (x.key === empty.key ? r : x));
      return [...rs, r];
    });
  }
  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function removeRow(key: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : [newRow()]));
  }

  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border rounded-lg p-3">
          <input
            placeholder="Tìm sản phẩm theo mã/tên rồi click để thêm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {search && (
            <div className="mt-2 max-h-60 overflow-y-auto border rounded divide-y">
              {filtered.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    addProduct(p);
                    setSearch("");
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 flex justify-between"
                >
                  <span><span className="font-mono">{p.maSp}</span> — {p.ten}</span>
                  <span className="text-neutral-500">
                    {p.giaBan.toLocaleString("vi-VN")}₫ · Tồn: {p.ton}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-neutral-500">Không có kết quả</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-3 py-2 w-1/3">Sản phẩm</th>
                <th className="px-3 py-2">SL</th>
                <th className="px-3 py-2">Giá bán</th>
                <th className="px-3 py-2">VAT %</th>
                <th className="px-3 py-2">CK %</th>
                <th className="px-3 py-2 text-right">Thành tiền</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const p = typeof r.productId === "number" ? productMap.get(r.productId) : undefined;
                const net = p ? lineNet(r) : 0;
                const ckMoney = p ? lineCk(r) : 0;
                return (
                  <tr key={r.key}>
                    <td className="px-3 py-2">
                      <select
                        name="product_id"
                        value={r.productId}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const pp = productMap.get(id);
                          updateRow(r.key, {
                            productId: id,
                            giaBan: pp?.giaBan ?? 0,
                            vat: pp?.vatBan ?? 0,
                          });
                        }}
                        className="w-full border rounded px-2 py-1 text-sm"
                        required
                      >
                        <option value="">— Chọn —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.maSp} — {p.ten}
                          </option>
                        ))}
                      </select>
                      {p && (
                        <div className="text-xs text-neutral-500 mt-1">Tồn: {p.ton}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name="so_luong"
                        type="number"
                        min={1}
                        value={r.soLuong}
                        onChange={(e) => updateRow(r.key, { soLuong: Number(e.target.value) || 0 })}
                        className="w-16 border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name="gia_ban_item"
                        type="number"
                        min={0}
                        value={r.giaBan}
                        onChange={(e) => updateRow(r.key, { giaBan: Number(e.target.value) || 0 })}
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
                        className="w-14 border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name="chiet_khau_pct_item"
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={r.chietKhauPct}
                        onChange={(e) =>
                          updateRow(r.key, { chietKhauPct: Number(e.target.value) || 0 })
                        }
                        className="w-16 border rounded px-2 py-1 text-sm"
                      />
                      <input type="hidden" name="chiet_khau_item" value={ckMoney} />
                    </td>
                    <td className="px-3 py-2 text-right">{net.toLocaleString("vi-VN")}₫</td>
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
          <div className="p-3 border-t">
            <button
              type="button"
              onClick={() => setRows((rs) => [...rs, newRow()])}
              className="text-sm text-blue-600 hover:underline"
            >
              + Thêm dòng trống
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h2 className="font-medium">Khách hàng</h2>
          <input
            name="sdt"
            value={sdt}
            onChange={(e) => setSdt(e.target.value)}
            onBlur={onSdtBlur}
            placeholder="SĐT (nhập rồi Tab để tự tra)"
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
          {customerHit && (
            <div className="text-xs text-blue-600">{customerHit}</div>
          )}
          <input
            name="khach_hang"
            value={khachHang}
            onChange={(e) => setKhachHang(e.target.value)}
            placeholder="Tên khách hàng"
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
          <input
            name="nhan_vien"
            placeholder="Nhân viên bán"
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              <span className="text-neutral-700">CK đơn (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={chietKhauDonPct}
                onChange={(e) => setChietKhauDonPct(Number(e.target.value) || 0)}
                className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-neutral-700">CK đơn (tiền)</span>
              <input
                type="number"
                min={0}
                value={chietKhauDonTien}
                onChange={(e) => setChietKhauDonTien(Number(e.target.value) || 0)}
                className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
              />
            </label>
          </div>
          <input type="hidden" name="chiet_khau" value={chietKhauDon} />
          <input type="hidden" name="chiet_khau_pct" value={chietKhauDonPct} />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Giảm</span>
            <span>{chietKhauDon.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Tổng tiền</span>
            <span>{tongTien.toLocaleString("vi-VN")}₫</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h2 className="font-medium">Thanh toán</h2>
          <PayField label="Tiền mặt" name="pay_tien_mat" value={tienMat} setValue={setTienMat} />
          <PayField label="Chuyển khoản" name="pay_chuyen_khoan" value={chuyenKhoan} setValue={setChuyenKhoan} />
          <input
            name="ma_giao_dich"
            placeholder="Mã giao dịch CK (nếu có)"
            className="w-full border rounded px-3 py-1 text-sm"
          />
          <PayField label="Quẹt thẻ" name="pay_quet_the" value={quetThe} setValue={setQuetThe} />
          <div className={`flex justify-between text-sm pt-2 border-t ${conLai === 0 ? "" : conLai > 0 ? "text-red-600" : "text-emerald-600"}`}>
            <span>{conLai > 0 ? "Còn thiếu" : conLai < 0 ? "Tiền thừa" : "Đủ"}</span>
            <span>{Math.abs(conLai).toLocaleString("vi-VN")}₫</span>
          </div>
        </div>

        <textarea
          name="ghi_chu"
          placeholder="Ghi chú đơn..."
          className="w-full border rounded px-3 py-1.5 text-sm"
          rows={2}
        />

        <button className="w-full bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700">
          Hoàn tất đơn
        </button>
      </div>
    </form>
  );
}

function PayField({
  label,
  name,
  value,
  setValue,
}: {
  label: string;
  name: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-neutral-700 shrink-0">{label}</span>
      <input
        name={name}
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(Number(e.target.value) || 0)}
        className="w-32 border rounded px-2 py-1 text-sm text-right"
      />
    </label>
  );
}
