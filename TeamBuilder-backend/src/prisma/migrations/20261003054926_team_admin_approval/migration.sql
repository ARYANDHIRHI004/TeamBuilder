-- CreateEnum
CREATE TYPE "TeamApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "approvalStatus" "TeamApprovalStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "hiring" SET DEFAULT 'INACTIVE';
