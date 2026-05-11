import { ProductForm } from "../form";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm sản phẩm</h1>
      <ProductForm action={createProduct} submitLabel="Tạo sản phẩm" />
    </div>
  );
}
