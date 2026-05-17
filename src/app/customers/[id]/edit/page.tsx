import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "../../form";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.customer.findUnique({ where: { id: Number(id) } });
  if (!c) notFound();

  const action = updateCustomer.bind(null, c.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sửa khách hàng</h1>
      <CustomerForm
        action={action}
        submitLabel="Cập nhật"
        values={{
          sdt: c.sdt,
          ten: c.ten,
          diaChi: c.diaChi,
          chietKhauPct: c.chietKhauPct.toString(),
          ghiChu: c.ghiChu,
        }}
      />
    </div>
  );
}
