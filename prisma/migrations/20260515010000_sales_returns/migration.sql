-- AlterEnum
ALTER TYPE "MovementType" ADD VALUE 'HANG_TRA';

-- CreateTable
CREATE TABLE "sales_returns" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ly_do" TEXT,
    "tong_hoan" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_return_items" (
    "id" SERIAL NOT NULL,
    "return_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "gia_ban" DECIMAL(14,2) NOT NULL,
    "gia_von" DECIMAL(14,2) NOT NULL,
    CONSTRAINT "sales_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_returns_order_id_idx" ON "sales_returns"("order_id");

-- AddForeignKey
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "sales_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
