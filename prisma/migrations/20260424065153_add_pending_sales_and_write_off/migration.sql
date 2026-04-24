-- CreateEnum
CREATE TYPE "PendingStatus" AS ENUM ('PENDING', 'RESOLVED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "LogEventType" ADD VALUE 'WRITE_OFF';

-- AlterEnum
ALTER TYPE "PhysicalStatus" ADD VALUE 'WRITE_OFF';

-- CreateTable
CREATE TABLE "PendingSale" (
    "id" TEXT NOT NULL,
    "tempName" TEXT NOT NULL,
    "tempPrice" DECIMAL(65,30) NOT NULL,
    "tempQuantity" INTEGER NOT NULL DEFAULT 1,
    "tempCategoryName" TEXT,
    "tempBrandName" TEXT,
    "cashDayId" INTEGER NOT NULL,
    "resolvedProductId" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "status" "PendingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingSale_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingSale" ADD CONSTRAINT "PendingSale_cashDayId_fkey" FOREIGN KEY ("cashDayId") REFERENCES "CashDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingSale" ADD CONSTRAINT "PendingSale_resolvedProductId_fkey" FOREIGN KEY ("resolvedProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
