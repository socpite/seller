-- AlterTable
ALTER TABLE "products" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "sdt" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "dia_chi" TEXT,
    "chiet_khau_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_sdt_key" ON "customers"("sdt");
