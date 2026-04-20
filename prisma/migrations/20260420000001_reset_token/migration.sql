ALTER TABLE "Therapist" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);
CREATE UNIQUE INDEX "Therapist_resetToken_key" ON "Therapist"("resetToken");
