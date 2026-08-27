-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_senderId_fkey";

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "momoProvider" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "senderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "transfiUserId" TEXT;

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "stripeCheckoutUrl" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paymentIntentStatus" TEXT,
    "customerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quantityTotal" INTEGER,
    "quantityUsed" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'fixed_amount',
    "baseCurrency" TEXT DEFAULT 'USD',
    "allowedCurrencies" TEXT[] DEFAULT ARRAY['USD']::TEXT[],
    "autoConvert" BOOLEAN DEFAULT false,
    "frequency" TEXT,
    "customIntervalDays" INTEGER,
    "durationType" TEXT,
    "durationMonths" INTEGER,
    "paymentsMade" INTEGER NOT NULL DEFAULT 0,
    "totalPayments" INTEGER,
    "endDate" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" SERIAL NOT NULL,
    "paymentLinkId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "paymentNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyConversion" (
    "id" SERIAL NOT NULL,
    "paymentLinkId" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "convertedAmount" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "rateSource" TEXT NOT NULL,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "agentCode" TEXT NOT NULL,
    "agentType" TEXT NOT NULL DEFAULT 'individual',
    "businessName" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'pending',
    "kycSubmittedAt" TIMESTAMP(3),
    "kycVerifiedAt" TIMESTAMP(3),
    "kycRejectedAt" TIMESTAMP(3),
    "kycRejectionReason" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "idFrontImage" TEXT,
    "idBackImage" TEXT,
    "selfieImage" TEXT,
    "addressProofImage" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashOnHand" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxCashOnHand" DECIMAL(10,2) NOT NULL DEFAULT 5000,
    "dailyTransactionLimit" DECIMAL(10,2) NOT NULL DEFAULT 10000,
    "monthlyTransactionLimit" DECIMAL(10,2) NOT NULL DEFAULT 100000,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentCashTransaction" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "feeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "reference" TEXT NOT NULL,
    "transactionId" INTEGER,
    "description" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentCashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDaySettlement" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startCash" DECIMAL(10,2) NOT NULL,
    "endCash" DECIMAL(10,2) NOT NULL,
    "totalCashIn" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCashOut" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalFeeEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "expectedEndCash" DECIMAL(10,2) NOT NULL,
    "variance" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "settledAt" TIMESTAMP(3),
    "settledBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDaySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_stripeSessionId_key" ON "PaymentLink"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PaymentLink_merchantId_idx" ON "PaymentLink"("merchantId");

-- CreateIndex
CREATE INDEX "PaymentLink_status_idx" ON "PaymentLink"("status");

-- CreateIndex
CREATE INDEX "PaymentLink_expiresAt_idx" ON "PaymentLink"("expiresAt");

-- CreateIndex
CREATE INDEX "PaymentLink_type_idx" ON "PaymentLink"("type");

-- CreateIndex
CREATE INDEX "PaymentLink_stripeSubscriptionId_idx" ON "PaymentLink"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_paymentLinkId_idx" ON "SubscriptionPayment"("paymentLinkId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "ExchangeRate_fromCurrency_toCurrency_idx" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE INDEX "CurrencyConversion_paymentLinkId_idx" ON "CurrencyConversion"("paymentLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_agentCode_key" ON "AgentProfile"("agentCode");

-- CreateIndex
CREATE INDEX "AgentProfile_userId_idx" ON "AgentProfile"("userId");

-- CreateIndex
CREATE INDEX "AgentProfile_agentCode_idx" ON "AgentProfile"("agentCode");

-- CreateIndex
CREATE INDEX "AgentProfile_kycStatus_idx" ON "AgentProfile"("kycStatus");

-- CreateIndex
CREATE UNIQUE INDEX "AgentCashTransaction_reference_key" ON "AgentCashTransaction"("reference");

-- CreateIndex
CREATE INDEX "AgentCashTransaction_agentId_idx" ON "AgentCashTransaction"("agentId");

-- CreateIndex
CREATE INDEX "AgentCashTransaction_userId_idx" ON "AgentCashTransaction"("userId");

-- CreateIndex
CREATE INDEX "AgentCashTransaction_status_idx" ON "AgentCashTransaction"("status");

-- CreateIndex
CREATE INDEX "AgentCashTransaction_reference_idx" ON "AgentCashTransaction"("reference");

-- CreateIndex
CREATE INDEX "AgentDaySettlement_agentId_idx" ON "AgentDaySettlement"("agentId");

-- CreateIndex
CREATE INDEX "AgentDaySettlement_status_idx" ON "AgentDaySettlement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDaySettlement_agentId_settlementDate_key" ON "AgentDaySettlement"("agentId", "settlementDate");

-- CreateIndex
CREATE INDEX "PaymentMethod_phoneNumber_idx" ON "PaymentMethod"("phoneNumber");

-- CreateIndex
CREATE INDEX "PaymentMethod_countryCode_idx" ON "PaymentMethod"("countryCode");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversion" ADD CONSTRAINT "CurrencyConversion_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCashTransaction" ADD CONSTRAINT "AgentCashTransaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCashTransaction" ADD CONSTRAINT "AgentCashTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDaySettlement" ADD CONSTRAINT "AgentDaySettlement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
