-- CreateTable
CREATE TABLE "DTAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT,
    "requirementId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "testMethod" TEXT NOT NULL DEFAULT '',
    "testResult" TEXT NOT NULL DEFAULT '',
    "verdict" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DTAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DTAssessment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DTAssessment_projectId_assetId_requirementId_assessmentType_key" ON "DTAssessment"("projectId", "assetId", "requirementId", "assessmentType");
