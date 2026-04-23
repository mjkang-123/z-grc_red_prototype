/*
  Warnings:

  - You are about to drop the column `questionId` on the `DTAnswer` table. All the data in the column will be lost.
  - Added the required column `nodeId` to the `DTAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirementId` to the `DTAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DTAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT,
    "mechanismCode" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DTAnswer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DTAnswer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DTAnswer" ("answer", "assetId", "createdAt", "id", "mechanismCode", "notes", "projectId", "updatedAt") SELECT "answer", "assetId", "createdAt", "id", "mechanismCode", "notes", "projectId", "updatedAt" FROM "DTAnswer";
DROP TABLE "DTAnswer";
ALTER TABLE "new_DTAnswer" RENAME TO "DTAnswer";
CREATE UNIQUE INDEX "DTAnswer_projectId_assetId_requirementId_nodeId_key" ON "DTAnswer"("projectId", "assetId", "requirementId", "nodeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
