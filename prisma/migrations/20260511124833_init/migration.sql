-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('NHAP', 'BAN', 'DIEU_CHINH', 'HANG_DOI');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TIEN_MAT', 'CHUYEN_KHOAN', 'QUET_THE');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "ma_sp" TEXT NOT NULL,
    "ma_sp_cha" TEXT,
    "ten" TEXT NOT NULL,
    "don_vi" TEXT NOT NULL DEFAULT 'Cái',
    "anh_url" TEXT,
    "gia_nhap" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vat_nhap" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gia_ban" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vat_ban" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gia_von" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gia_si" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ton" INTEGER NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "type" "MovementType" NOT NULL,
    "ref_id" INTEGER,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nha_cung_cap" TEXT,
    "phi_van_chuyen" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tong_tien" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "gia_nhap" DECIMAL(14,2) NOT NULL,
    "vat" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gia_von_lo" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" SERIAL NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kenh" TEXT NOT NULL DEFAULT 'offline',
    "khach_hang" TEXT,
    "sdt" TEXT,
    "chiet_khau" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tong_tien" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loi_nhuan" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ghi_chu" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "gia_ban" DECIMAL(14,2) NOT NULL,
    "gia_von" DECIMAL(14,2) NOT NULL,
    "vat" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "chiet_khau" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "sales_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "phuong_thuc" "PaymentMethod" NOT NULL,
    "so_tien" DECIMAL(14,2) NOT NULL,
    "ma_giao_dich" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_ma_sp_key" ON "products"("ma_sp");

-- CreateIndex
CREATE INDEX "products_ma_sp_cha_idx" ON "products"("ma_sp_cha");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_created_at_idx" ON "stock_movements"("product_id", "created_at");

-- CreateIndex
CREATE INDEX "sales_orders_ngay_idx" ON "sales_orders"("ngay");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
