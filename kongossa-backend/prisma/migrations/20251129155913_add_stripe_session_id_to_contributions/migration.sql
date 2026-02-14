/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `tontine_contributions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tontine_contributions" ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tontine_contributions_stripeSessionId_key" ON "tontine_contributions"("stripeSessionId");
