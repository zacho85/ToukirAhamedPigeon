-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeConnectId" TEXT,
ALTER COLUMN "profileImage" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WalletPayout" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletPayout_userId_idx" ON "WalletPayout"("userId");

-- AddForeignKey
ALTER TABLE "WalletPayout" ADD CONSTRAINT "WalletPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
