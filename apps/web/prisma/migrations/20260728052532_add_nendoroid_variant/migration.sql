-- CreateTable
CREATE TABLE "NendoroidVariant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "officialUrl" TEXT,
    "nendoroidId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NendoroidVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NendoroidVariant_nendoroidId_idx" ON "NendoroidVariant"("nendoroidId");

-- CreateIndex
CREATE UNIQUE INDEX "NendoroidVariant_source_sourceId_key" ON "NendoroidVariant"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "NendoroidVariant" ADD CONSTRAINT "NendoroidVariant_nendoroidId_fkey" FOREIGN KEY ("nendoroidId") REFERENCES "Nendoroid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
