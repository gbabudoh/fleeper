-- Add missing columns to User
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "stripeAccountId" TEXT;

-- Add unique constraints on User
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");

-- Add missing columns to Transaction
ALTER TABLE "Transaction" ADD COLUMN "linkId" UUID;

-- Add index and foreign key on Transaction.linkId
CREATE INDEX "Transaction_linkId_idx" ON "Transaction"("linkId");
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "PaymentLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraint on Transaction.stripePaymentId
CREATE UNIQUE INDEX "Transaction_stripePaymentId_key" ON "Transaction"("stripePaymentId");

-- Add missing column to PaymentLink
ALTER TABLE "PaymentLink" ADD COLUMN "customSplits" JSONB;
