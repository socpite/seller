export type CustomerFormValues = {
  sdt?: string;
  ten?: string;
  diaChi?: string | null;
  chietKhauPct?: string | number;
  ghiChu?: string | null;
};

export function CustomerForm({
  action,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  values?: CustomerFormValues;
  submitLabel: string;
}) {
  const v = values ?? {};
  return (
    <form action={action} className="space-y-4 bg-white border rounded-lg p-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="SDT *" name="sdt" defaultValue={v.sdt} required />
        <Field label="Tên *" name="ten" defaultValue={v.ten} required />
        <Field label="Địa chỉ" name="dia_chi" defaultValue={v.diaChi ?? ""} full />
        <Field
          label="Chiết khấu mặc định (%)"
          name="chiet_khau_pct"
          type="number"
          step="0.01"
          defaultValue={v.chietKhauPct?.toString() ?? "0"}
        />
      </div>
      <div>
        <label className="text-sm text-neutral-700">Ghi chú</label>
        <textarea
          name="ghi_chu"
          defaultValue={v.ghiChu ?? ""}
          rows={2}
          className="w-full border rounded px-3 py-1.5 mt-1"
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
      <input {...rest} className="w-full border rounded px-3 py-1.5 mt-1 text-sm" />
    </label>
  );
}
