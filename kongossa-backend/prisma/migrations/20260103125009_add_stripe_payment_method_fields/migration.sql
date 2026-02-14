/*
  Warnings:

  - A unique constraint covering the columns `[stripePmId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "expiryMonth" INTEGER,
ADD COLUMN     "expiryYear" INTEGER,
ADD COLUMN     "stripeCustomer" TEXT,
ADD COLUMN     "stripePmId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePmId_key" ON "PaymentMethod"("stripePmId");
