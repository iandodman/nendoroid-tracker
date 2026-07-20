/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceId]` on the table `Nendoroid` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Nendoroid" ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "officialUrl" TEXT,
ADD COLUMN     "releaseMonth" INTEGER,
ADD COLUMN     "releaseYear" INTEGER,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceId" TEXT,
ALTER COLUMN "series" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Nendoroid_source_sourceId_key" ON "Nendoroid"("source", "sourceId");
