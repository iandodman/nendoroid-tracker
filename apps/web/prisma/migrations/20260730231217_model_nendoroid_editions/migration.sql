/*
  Warnings:

  - You are about to drop the column `officialUrl` on the `Nendoroid` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Nendoroid` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `Nendoroid` table. All the data in the column will be lost.
  - You are about to drop the `NendoroidVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NendoroidVariant" DROP CONSTRAINT "NendoroidVariant_nendoroidId_fkey";

-- DropIndex
DROP INDEX "Nendoroid_source_sourceId_key";

-- AlterTable
ALTER TABLE "Nendoroid" DROP COLUMN "officialUrl",
DROP COLUMN "source",
DROP COLUMN "sourceId";

-- DropTable
DROP TABLE "NendoroidVariant";

-- CreateTable
CREATE TABLE "NendoroidEdition" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "officialUrl" TEXT,
    "nendoroidId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NendoroidEdition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NendoroidEdition_nendoroidId_idx" ON "NendoroidEdition"("nendoroidId");

-- CreateIndex
CREATE UNIQUE INDEX "NendoroidEdition_nendoroidId_slug_key" ON "NendoroidEdition"("nendoroidId", "slug");

-- AddForeignKey
ALTER TABLE "NendoroidEdition" ADD CONSTRAINT "NendoroidEdition_nendoroidId_fkey" FOREIGN KEY ("nendoroidId") REFERENCES "Nendoroid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
