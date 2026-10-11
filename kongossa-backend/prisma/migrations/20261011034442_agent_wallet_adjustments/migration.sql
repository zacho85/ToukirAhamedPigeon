-- CreateTable
CREATE TABLE "AgentWalletAdjustment" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "adminUserId" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "transactionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentWalletAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentWalletAdjustment_agentId_idx" ON "AgentWalletAdjustment"("agentId");

-- AddForeignKey
ALTER TABLE "AgentWalletAdjustment" ADD CONSTRAINT "AgentWalletAdjustment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWalletAdjustment" ADD CONSTRAINT "AgentWalletAdjustment_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
