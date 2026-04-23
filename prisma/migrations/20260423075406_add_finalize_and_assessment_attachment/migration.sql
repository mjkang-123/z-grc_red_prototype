-- AlterTable
ALTER TABLE "DTAssessment" ADD COLUMN "attachmentFilename" TEXT;
ALTER TABLE "DTAssessment" ADD COLUMN "attachmentMimeType" TEXT;
ALTER TABLE "DTAssessment" ADD COLUMN "attachmentSize" INTEGER;
ALTER TABLE "DTAssessment" ADD COLUMN "attachmentStoredPath" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "finalizedAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "finalizedBy" TEXT;
ALTER TABLE "Project" ADD COLUMN "finalizedNote" TEXT;
