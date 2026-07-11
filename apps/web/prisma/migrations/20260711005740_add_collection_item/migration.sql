-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "nendoroidId" INTEGER NOT NULL,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionItem_nendoroidId_idx" ON "CollectionItem"("nendoroidId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_userId_nendoroidId_key" ON "CollectionItem"("userId", "nendoroidId");

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_nendoroidId_fkey" FOREIGN KEY ("nendoroidId") REFERENCES "Nendoroid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
