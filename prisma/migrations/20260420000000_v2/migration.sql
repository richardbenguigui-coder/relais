-- AlterEnum: add BOTH_FEEDBACK to ClosureStatus
ALTER TYPE "ClosureStatus" ADD VALUE 'BOTH_FEEDBACK';

-- CreateEnum: ClosureType
CREATE TYPE "ClosureType" AS ENUM ('STANDARD', 'INTERRUPTED');

-- CreateEnum: ReviewPlatform
CREATE TYPE "ReviewPlatform" AS ENUM ('GOOGLE', 'TRUSTPILOT', 'AVIS_VERIFIES');

-- AlterTable: Closure — add closureType and publicFeedbackAt
ALTER TABLE "Closure" ADD COLUMN "closureType" "ClosureType" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "Closure" ADD COLUMN "publicFeedbackAt" TIMESTAMP(3);

-- AlterTable: Therapist — rename googleReviewLink to reviewLink, add reviewPlatform
ALTER TABLE "Therapist" RENAME COLUMN "googleReviewLink" TO "reviewLink";
ALTER TABLE "Therapist" ADD COLUMN "reviewPlatform" "ReviewPlatform" NOT NULL DEFAULT 'GOOGLE';
