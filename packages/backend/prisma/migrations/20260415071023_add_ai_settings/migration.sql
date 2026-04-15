-- CreateTable
CREATE TABLE "AISettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "includeGender" BOOLEAN NOT NULL DEFAULT true,
    "includeAge" BOOLEAN NOT NULL DEFAULT true,
    "includeBloodType" BOOLEAN NOT NULL DEFAULT true,
    "includeHeight" BOOLEAN NOT NULL DEFAULT true,
    "includeWeight" BOOLEAN NOT NULL DEFAULT true,
    "includeAllergies" BOOLEAN NOT NULL DEFAULT true,
    "includeChronic" BOOLEAN NOT NULL DEFAULT true,
    "includeName" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AISettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AISettings_userId_key" ON "AISettings"("userId");
