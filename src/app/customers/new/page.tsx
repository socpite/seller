import { CustomerForm } from "../form";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thêm khách hàng</h1>
      <CustomerForm action={createCustomer} submitLabel="Tạo" />
    </div>
  );
}
