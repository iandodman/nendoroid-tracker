/*
  Warnings:

  - Added the required column `numberBase` to the `Nendoroid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nendoroid" ADD COLUMN     "numberBase" INTEGER NOT NULL,
ADD COLUMN     "numberSuffix" TEXT;

-- CreateIndex
CREATE INDEX "Nendoroid_numberBase_numberSuffix_idx" ON "Nendoroid"("numberBase", "numberSuffix");
