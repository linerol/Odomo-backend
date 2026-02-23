-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('TAMAGO', 'CHIBI', 'GENIN', 'CHUNIN', 'JONIN', 'KAGE');

-- CreateEnum
CREATE TYPE "LifeState" AS ENUM ('ALIVE', 'SICK', 'DEAD');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ONIGIRI', 'RAMEN', 'BENTO_ROYAL', 'SOAP', 'MEDICINE', 'SOUL_STONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "kobanBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odomo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Odomo',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "stage" "Stage" NOT NULL DEFAULT 'TAMAGO',
    "evolutionVariant" TEXT,
    "hunger" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "happiness" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "hygiene" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "lifeState" "LifeState" NOT NULL DEFAULT 'ALIVE',
    "birthDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStepSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Odomo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Odomo_userId_key" ON "Odomo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_userId_itemType_key" ON "InventoryItem"("userId", "itemType");

-- AddForeignKey
ALTER TABLE "Odomo" ADD CONSTRAINT "Odomo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
