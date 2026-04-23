-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "productType" TEXT,
    "productDescription" TEXT,
    "userId" TEXT,
    "applicable1" BOOLEAN NOT NULL DEFAULT false,
    "applicable2" BOOLEAN NOT NULL DEFAULT false,
    "applicable3" BOOLEAN NOT NULL DEFAULT false,
    "mechanismCandidates" TEXT NOT NULL DEFAULT '[]',
    "screeningComplete" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" DATETIME,
    "finalizedBy" TEXT,
    "finalizedNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("applicable1", "applicable2", "applicable3", "contactEmail", "contactName", "createdAt", "finalizedAt", "finalizedBy", "finalizedNote", "id", "manufacturer", "mechanismCandidates", "name", "productDescription", "productType", "screeningComplete", "updatedAt") SELECT "applicable1", "applicable2", "applicable3", "contactEmail", "contactName", "createdAt", "finalizedAt", "finalizedBy", "finalizedNote", "id", "manufacturer", "mechanismCandidates", "name", "productDescription", "productType", "screeningComplete", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
