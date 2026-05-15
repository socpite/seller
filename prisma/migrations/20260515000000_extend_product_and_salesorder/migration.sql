-- AlterEnum
ALTER TYPE "MovementType" ADD VALUE 'XUAT_HUY';

-- AlterTable
ALTER TABLE "products"
  ADD COLUMN "ma_vach" TEXT,
  ADD COLUMN "danh_muc" TEXT,
  ADD COLUMN "hang_trong" TEXT,
  ADD COLUMN "link_web" TEXT;

-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN "nhan_vien" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_ma_vach_key" ON "products"("ma_vach");
