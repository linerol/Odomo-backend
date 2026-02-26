-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemType" ADD VALUE 'CANDY';
ALTER TYPE "ItemType" ADD VALUE 'PLUSH_TOY';
ALTER TYPE "ItemType" ADD VALUE 'SPONGE';
ALTER TYPE "ItemType" ADD VALUE 'BUBBLE_BATH';
ALTER TYPE "ItemType" ADD VALUE 'ENERGY_DRINK';
