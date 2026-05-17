import Link from "next/link";
import { ImportForm } from "./form";

export default function ImportPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Import sản phẩm</h1>
        <Link href="/products" className="text-sm text-blue-600">← Kho hàng</Link>
      </div>

      <div className="bg-white border rounded-lg p-4 text-sm space-y-2">
        <p>Upload file XLSX (như file kho hiện tại của bạn). Các cột nhận dạng:</p>
        <ul className="list-disc pl-5 text-neutral-600 space-y-0.5">
          <li><b>Mã sản phẩm</b> (hoặc <b>ID sản phẩm</b> nếu cột mã rỗng) — bắt buộc, dùng để định danh / cập nhật</li>
          <li><b>Tên sản phẩm</b> — bắt buộc</li>
          <li>Mã vạch, Mã SP cha, Đơn vị tính, Link ảnh, Danh mục, Hãng tròng, Link website</li>
          <li>Giá nhập, VAT nhập, Giá bán, VAT, Giá vốn, Tổng tồn</li>
        </ul>
        <p className="text-neutral-600">
          Sản phẩm đã tồn tại (cùng mã SP) sẽ được <b>cập nhật</b>, sản phẩm mới sẽ được <b>thêm</b>.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
