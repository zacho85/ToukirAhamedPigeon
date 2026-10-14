-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "maxTransactionAmount" DECIMAL(10,2) NOT NULL DEFAULT 5000;

-- CreateTable
CREATE TABLE "AgentSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "cashoutOtpThreshold" DOUBLE PRECISION,
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentSettings_pkey" PRIMARY KEY ("id")
);
