/*
  Warnings:

  - Added the required column `userId` to the `ChatHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `HealthMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatHistory" ("content", "createdAt", "id", "role", "sessionId") SELECT "content", "createdAt", "id", "role", "sessionId" FROM "ChatHistory";
DROP TABLE "ChatHistory";
ALTER TABLE "new_ChatHistory" RENAME TO "ChatHistory";
CREATE INDEX "ChatHistory_userId_idx" ON "ChatHistory"("userId");
CREATE INDEX "ChatHistory_userId_sessionId_idx" ON "ChatHistory"("userId", "sessionId");
CREATE TABLE "new_HealthMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "recordedAt" DATETIME NOT NULL,
    "visitId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "HealthMetric_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HealthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HealthMetric" ("id", "notes", "recordedAt", "type", "unit", "value", "visitId") SELECT "id", "notes", "recordedAt", "type", "unit", "value", "visitId" FROM "HealthMetric";
DROP TABLE "HealthMetric";
ALTER TABLE "new_HealthMetric" RENAME TO "HealthMetric";
CREATE INDEX "HealthMetric_userId_idx" ON "HealthMetric"("userId");
CREATE TABLE "new_Medication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visitId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "Medication_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Medication" ("dosage", "endDate", "frequency", "id", "isActive", "name", "notes", "startDate", "visitId") SELECT "dosage", "endDate", "frequency", "id", "isActive", "name", "notes", "startDate", "visitId" FROM "Medication";
DROP TABLE "Medication";
ALTER TABLE "new_Medication" RENAME TO "Medication";
CREATE INDEX "Medication_userId_idx" ON "Medication"("userId");
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "birthDate" DATETIME,
    "bloodType" TEXT,
    "height" REAL,
    "weight" REAL,
    "allergies" TEXT,
    "chronicDiseases" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("allergies", "birthDate", "bloodType", "chronicDiseases", "gender", "height", "id", "name", "updatedAt", "weight") SELECT "allergies", "birthDate", "bloodType", "chronicDiseases", "gender", "height", "id", "name", "updatedAt", "weight" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE TABLE "new_Visit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "hospital" TEXT NOT NULL,
    "department" TEXT,
    "chiefComplaint" TEXT,
    "diagnosis" TEXT,
    "doctorAdvice" TEXT,
    "attachments" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("attachments", "chiefComplaint", "createdAt", "department", "diagnosis", "doctorAdvice", "hospital", "id", "notes", "visitDate") SELECT "attachments", "chiefComplaint", "createdAt", "department", "diagnosis", "doctorAdvice", "hospital", "id", "notes", "visitDate" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE INDEX "Visit_userId_idx" ON "Visit"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
