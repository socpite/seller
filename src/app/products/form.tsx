export type ProductFormValues = {
  maSp?: string;
  maSpCha?: string | null;
  maVach?: string | null;
  ten?: string;
  donVi?: string;
  anhUrl?: string | null;
  danhMuc?: string | null;
  hangTrong?: string | null;
  linkWeb?: string | null;
  giaNhap?: string | number;
  vatNhap?: string | number;
  giaBan?: string | number;
  vatBan?: string | number;
  giaVon?: string | number;
  giaSi?: string | number;
  ghiChu?: string | null;
};

export function ProductForm({
  action,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  values?: ProductFormValues;
  submitLabel: string;
}) {
  const v = values ?? {};
  return (
    <form action={action} className="space-y-4 bg-white border rounded-lg p-6 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Mã SP *" name="ma_sp" defaultValue={v.maSp} required />
        <Field label="Mã SP cha" name="ma_sp_cha" defaultValue={v.maSpCha ?? ""} />
        <Field label="Mã vạch" name="ma_vach" defaultValue={v.maVach ?? ""} />
        <Field label="Tên sản phẩm *" name="ten" defaultValue={v.ten} required full />
        <Field label="Đơn vị tính" name="don_vi" defaultValue={v.donVi ?? "Cái"} />
        <Field label="Danh mục" name="danh_muc" defaultValue={v.danhMuc ?? ""} />
        <Field label="Hãng tròng" name="hang_trong" defaultValue={v.hangTrong ?? ""} />
        <Field label="Link ảnh" name="anh_url" defaultValue={v.anhUrl ?? ""} />
        <Field label="Link website" name="link_web" defaultValue={v.linkWeb ?? ""} />
        <Field label="Giá nhập" name="gia_nhap" type="number" defaultValue={v.giaNhap?.toString() ?? "0"} />
        <Field label="VAT nhập (%)" name="vat_nhap" type="number" defaultValue={v.vatNhap?.toString() ?? "0"} />
        <Field label="Giá bán" name="gia_ban" type="number" defaultValue={v.giaBan?.toString() ?? "0"} />
        <Field label="VAT bán (%)" name="vat_ban" type="number" defaultValue={v.vatBan?.toString() ?? "0"} />
        <Field label="Giá vốn" name="gia_von" type="number" defaultValue={v.giaVon?.toString() ?? "0"} />
        <Field label="Giá sỉ" name="gia_si" type="number" defaultValue={v.giaSi?.toString() ?? "0"} />
      </div>
      <div>
        <label className="text-sm text-neutral-700">Ghi chú</label>
        <textarea
          name="ghi_chu"
          defaultValue={v.ghiChu ?? ""}
          className="w-full border rounded px-3 py-1.5 mt-1"
          rows={2}
        />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  full,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; full?: boolean }) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-neutral-700">{label}</span>
      <input
        {...rest}
        className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
      />
    </label>
  );
}
