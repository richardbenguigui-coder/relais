-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ClosureStatus" AS ENUM ('SCHEDULED', 'EMAIL_SENT', 'PRIVATE_FEEDBACK', 'PUBLIC_TESTIMONIAL', 'NO_FOLLOW_UP');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('PATIENT_J21', 'PATIENT_J28');

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "googleReviewLink" TEXT,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Closure" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "patientFirstName" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "closureDate" TIMESTAMP(3) NOT NULL,
    "status" "ClosureStatus" NOT NULL DEFAULT 'SCHEDULED',
    "token" TEXT NOT NULL,
    "email21SentAt" TIMESTAMP(3),
    "email28SentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Closure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "closureId" TEXT NOT NULL,
    "answer1" TEXT,
    "answer2" TEXT,
    "answer3" TEXT,
    "answer4" TEXT,
    "answer5" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledEmail" (
    "id" TEXT NOT NULL,
    "closureId" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_email_key" ON "Therapist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_stripeCustomerId_key" ON "Therapist"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_stripeSubscriptionId_key" ON "Therapist"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Closure_token_key" ON "Closure"("token");

-- CreateIndex
CREATE INDEX "Closure_therapistId_idx" ON "Closure"("therapistId");

-- CreateIndex
CREATE INDEX "Closure_status_idx" ON "Closure"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_closureId_key" ON "Feedback"("closureId");

-- CreateIndex
CREATE INDEX "ScheduledEmail_scheduledAt_sentAt_idx" ON "ScheduledEmail"("scheduledAt", "sentAt");

-- AddForeignKey
ALTER TABLE "Closure" ADD CONSTRAINT "Closure_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_closureId_fkey" FOREIGN KEY ("closureId") REFERENCES "Closure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledEmail" ADD CONSTRAINT "ScheduledEmail_closureId_fkey" FOREIGN KEY ("closureId") REFERENCES "Closure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
