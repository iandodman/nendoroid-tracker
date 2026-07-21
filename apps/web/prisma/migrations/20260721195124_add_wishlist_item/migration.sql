-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "nendoroidId" INTEGER NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistItem_nendoroidId_idx" ON "WishlistItem"("nendoroidId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_userId_nendoroidId_key" ON "WishlistItem"("userId", "nendoroidId");

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_nendoroidId_fkey" FOREIGN KEY ("nendoroidId") REFERENCES "Nendoroid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
