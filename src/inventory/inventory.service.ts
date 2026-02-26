import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OdomoService } from '../odomo/odomo.service.js';
import { BuyItemDto } from './dto/buy-item.dto.js';
import { UseItemDto } from './dto/use-item.dto.js';
import type { ItemType, InventoryItem } from '@prisma/client';

// Prix des objets en Kobans
const ITEM_PRICES: Record<ItemType, number> = {
  ONIGIRI: 10,
  RAMEN: 25,
  BENTO_ROYAL: 50,
  SOAP: 15,
  MEDICINE: 40,
  SOUL_STONE: 200,
  CANDY: 5,
  PLUSH_TOY: 30,
  SPONGE: 5,
  BUBBLE_BATH: 40,
  ENERGY_DRINK: 15,
};

// Type pour les effets des objets
type ItemEffect = {
  hunger?: number;
  happiness?: number;
  hygiene?: number;
  heal?: boolean;
  resurrect?: boolean;
};

// Effets des objets
const ITEM_EFFECTS: Record<ItemType, ItemEffect> = {
  // Nourriture
  ONIGIRI: { hunger: 20 },
  RAMEN: { hunger: 40, happiness: 10 },
  BENTO_ROYAL: { hunger: 100, happiness: 40 },

  // Hygiène
  SOAP: { hygiene: 50, happiness: 5 },
  SPONGE: { hygiene: 20, happiness: 2 },
  BUBBLE_BATH: { hygiene: 100, happiness: 15 },

  // Bonheur
  CANDY: { happiness: 15 },
  PLUSH_TOY: { happiness: 50 },

  // Soins
  MEDICINE: { heal: true, happiness: 15 },
  ENERGY_DRINK: { hunger: 15, happiness: 10, hygiene: 10 },

  // Résurrection
  SOUL_STONE: { resurrect: true },
};

// Descriptions des objets
const ITEM_DESCRIPTIONS: Record<ItemType, string> = {
  ONIGIRI: 'A simple rice ball. Restores a bit of hunger.',
  RAMEN: 'A warm bowl of ramen. Fills the belly and lifts the spirit.',
  BENTO_ROYAL: 'A premium bento box. Fully restores hunger and greatly boosts happiness.',
  SOAP: 'Gentle soap for a fresh bath. Restores hygiene.',
  MEDICINE: 'Cures sickness and cheers up your Odomo.',
  SOUL_STONE: 'A mystical stone that can bring back a fallen Odomo.',
  CANDY: 'A sweet treat. Gives a small happiness boost.',
  PLUSH_TOY: 'A cuddly plush toy. Your Odomo loves it!',
  SPONGE: 'A basic sponge. A quick, cheap scrub.',
  BUBBLE_BATH: 'A luxurious bubble bath. Full hygiene restore and a mood boost.',
  ENERGY_DRINK: 'A fizzy energy drink. Small boost to hunger, happiness, and hygiene.',
};

// Catégories des objets
const ITEM_CATEGORIES: Record<ItemType, string> = {
  ONIGIRI: 'food',
  RAMEN: 'food',
  BENTO_ROYAL: 'food',
  SOAP: 'hygiene',
  SPONGE: 'hygiene',
  BUBBLE_BATH: 'hygiene',
  CANDY: 'happiness',
  PLUSH_TOY: 'happiness',
  MEDICINE: 'care',
  ENERGY_DRINK: 'food',
  SOUL_STONE: 'special',
};

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => OdomoService))
    private readonly odomoService: OdomoService,
  ) { }

  async getInventory(userId: string): Promise<InventoryItem[]> {
    return this.prisma.inventoryItem.findMany({
      where: { userId },
      orderBy: { itemType: 'asc' },
    });
  }

  getShopItems() {
    const itemTypes = Object.keys(ITEM_PRICES) as ItemType[];
    return itemTypes.map((itemType) => ({
      itemType,
      price: ITEM_PRICES[itemType],
      effects: ITEM_EFFECTS[itemType],
      description: ITEM_DESCRIPTIONS[itemType],
      category: ITEM_CATEGORIES[itemType],
    }));
  }

  async buyItem(userId: string, buyItemDto: BuyItemDto) {
    const { itemType, quantity } = buyItemDto;

    const price = ITEM_PRICES[itemType];
    const totalCost = price * quantity;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier le solde
    if (user.kobanBalance < totalCost) {
      throw new BadRequestException(
        `Insufficient Kobans. Need ${totalCost}, have ${user.kobanBalance}`,
      );
    }

    // 🔒 TRANSACTION ATOMIQUE
    const [updatedUser, inventoryItem] = await this.prisma.$transaction([
      // 1. Déduire les Kobans
      this.prisma.user.update({
        where: { id: userId },
        data: {
          kobanBalance: user.kobanBalance - totalCost,
        },
      }),

      // 2. Ajouter l'objet à l'inventaire (upsert)
      this.prisma.inventoryItem.upsert({
        where: {
          userId_itemType: {
            userId,
            itemType,
          },
        },
        update: {
          quantity: {
            increment: quantity,
          },
        },
        create: {
          userId,
          itemType,
          quantity,
        },
      }),
    ]);

    return {
      success: true,
      itemType,
      quantityBought: quantity,
      totalCost,
      newKobanBalance: updatedUser.kobanBalance,
      newQuantity: inventoryItem.quantity,
    };
  }

  async useItem(userId: string, useItemDto: UseItemDto) {
    const { itemType } = useItemDto;

    // Vérifier que l'utilisateur a l'objet
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: {
        userId_itemType: {
          userId,
          itemType,
        },
      },
    });

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      throw new BadRequestException(`You don't have any ${itemType}`);
    }

    // Récupérer l'Odomo
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found');
    }

    const stats = await this.odomoService.getLiveStats(userId);
    const effect = ITEM_EFFECTS[itemType];

    // Vérifications spécifiques
    if (effect.heal && !stats.isSick) {
      throw new BadRequestException('Odomo is not sick');
    }

    if (effect.resurrect && !stats.isDead) {
      throw new BadRequestException('Odomo is not dead');
    }

    if (!effect.resurrect && stats.isDead) {
      throw new BadRequestException('Cannot use items on a dead Odomo. Use SOUL_STONE first.');
    }

    // Calculer les nouvelles stats
    const updates: any = {};

    if (effect.hunger !== undefined) {
      updates.hunger = Math.min(100, stats.hunger + effect.hunger);
    }

    if (effect.happiness !== undefined) {
      updates.happiness = Math.min(100, stats.happiness + effect.happiness);
    }

    if (effect.hygiene !== undefined) {
      updates.hygiene = Math.min(100, stats.hygiene + effect.hygiene);
    }

    if (effect.heal) {
      updates.lifeState = 'ALIVE';
      updates.happiness = Math.min(100, stats.happiness + (effect.happiness || 0));
    }

    if (effect.resurrect) {
      updates.lifeState = 'ALIVE';
      updates.hunger = 50;
      updates.happiness = 50;
      updates.hygiene = 50;
    }

    // Toujours mettre à jour lastInteractionAt
    updates.lastInteractionAt = new Date();

    // 🔒 TRANSACTION ATOMIQUE
    const [updatedOdomo, updatedInventory] = await this.prisma.$transaction([
      // 1. Appliquer l'effet sur l'Odomo
      this.prisma.odomo.update({
        where: { userId },
        data: updates,
      }),

      // 2. Décrémenter la quantité
      this.prisma.inventoryItem.update({
        where: {
          userId_itemType: {
            userId,
            itemType,
          },
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      }),
    ]);

    // Supprimer l'objet si quantité = 0
    if (updatedInventory.quantity === 0) {
      await this.prisma.inventoryItem.delete({
        where: {
          userId_itemType: {
            userId,
            itemType,
          },
        },
      });
    }

    // Retourner les stats fraîches
    const freshStats = await this.odomoService.getLiveStats(userId);

    return {
      success: true,
      itemUsed: itemType,
      remainingQuantity: Math.max(0, updatedInventory.quantity),
      odomo: freshStats,
    };
  }
}
