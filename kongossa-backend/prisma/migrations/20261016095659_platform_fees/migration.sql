-- Platform fee settings (new columns on the versioned SystemSettings rows).
ALTER TABLE "SystemSettings" ADD COLUMN "depositFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "withdrawalFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN "p2pFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN "p2pFreeDailyAmount" DOUBLE PRECISION NOT NULL DEFAULT 13,
ADD COLUMN "mobileMoneyFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 1.5;

-- The platform account: fees are credited to it and agent commissions are
-- paid from it, so both are ordinary ledger movements between users. It has
-- no password (cannot sign in) and status 'system' (cannot be looked up or
-- paid by customers). Its balance may go below zero.
INSERT INTO "User" ("role", "email", "fullName", "walletBalance", "currency", "accountType", "userType",
                    "status", "kycStatus", "approvalStatus", "address", "country", "dateOfBirth", "updatedAt")
VALUES ('platform', 'platform@kongossapay.system', 'KongossaPay Platform', 0, 'USD', 'platform', 'platform',
        'system', 'verified', 'approved', 'System account', 'XX', '2000-01-01', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;
