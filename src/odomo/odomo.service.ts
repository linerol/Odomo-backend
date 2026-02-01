import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOdomoDto } from './dto/create-odomo.dto.js';
import { InteractDto, InteractionType } from './dto/interact.dto.js';
import { OdomoStatsDto } from './dto/odomo-stats.dto.js';
import type { Odomo, Stage, LifeState } from '../../generated/prisma/index.js';

// Constantes du jeu
const DECAY_RATES = {
  HUNGER: 2.5, // perte par heure
  HAPPINESS: 1.5,
  HYGIENE: 2.0,
};

const HEALTH_THRESHOLDS = {
  SICK_HOURS: 16,
  DEAD_HOURS: 32,
};

// Fonction pour calculer l'XP requis pour passer au niveau suivant
// Formule progressive : 100 × niveau^1.5
const getXpRequiredForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

const STAGE_REQUIREMENTS = {
  TAMAGO: 0,
  CHIBI: 1,
  GENIN: 5,
  CHUNIN: 10,
  JONIN: 20,
  KAGE: 50,
};

@Injectable()
export class OdomoService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createOdomoDto: CreateOdomoDto): Promise<Odomo> {
    // Vérifier qu'un Odomo n'existe pas déjà
    const existing = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('User already has an Odomo');
    }

    // Créer le nouvel Odomo (naissance)
    return this.prisma.odomo.create({
      data: {
        userId,
        name: createOdomoDto.name || 'Odomo',
        level: 1,
        xp: 0,
        stage: 'TAMAGO',
        hunger: 100.0,
        happiness: 100.0,
        hygiene: 100.0,
        lifeState: 'ALIVE',
        birthDate: new Date(),
        lastInteractionAt: new Date(),
        lastStepSyncAt: new Date(),
      },
    });
  }

  async getLiveStats(userId: string): Promise<OdomoStatsDto> {
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found');
    }

    // Calculer le temps écoulé depuis la dernière interaction
    const now = new Date();
    const lastInteraction = new Date(odomo.lastInteractionAt);
    const deltaMs = now.getTime() - lastInteraction.getTime();
    const deltaHours = deltaMs / (1000 * 60 * 60);

    // Calculer les stats en temps réel
    const liveHunger = Math.max(0, odomo.hunger - (DECAY_RATES.HUNGER * deltaHours));
    const liveHappiness = Math.max(0, odomo.happiness - (DECAY_RATES.HAPPINESS * deltaHours));
    const liveHygiene = Math.max(0, odomo.hygiene - (DECAY_RATES.HYGIENE * deltaHours));

    // Déterminer le lifeState basé sur le temps
    let liveState: LifeState = odomo.lifeState;
    if (deltaHours > HEALTH_THRESHOLDS.DEAD_HOURS) {
      liveState = 'DEAD';
    } else if (deltaHours > HEALTH_THRESHOLDS.SICK_HOURS) {
      liveState = 'SICK';
    }

    // Construire le DTO de réponse
    const stats: OdomoStatsDto = {
      id: odomo.id,
      userId: odomo.userId,
      name: odomo.name,
      level: odomo.level,
      xp: odomo.xp,
      stage: odomo.stage,
      evolutionVariant: odomo.evolutionVariant,
      hunger: Math.round(liveHunger * 10) / 10,
      happiness: Math.round(liveHappiness * 10) / 10,
      hygiene: Math.round(liveHygiene * 10) / 10,
      lifeState: liveState,
      birthDate: odomo.birthDate,
      lastInteractionAt: odomo.lastInteractionAt,
      lastStepSyncAt: odomo.lastStepSyncAt,
      timeSinceLastInteraction: Math.round(deltaHours * 10) / 10,
      needsAttention: liveHunger < 30 || liveHappiness < 30 || liveHygiene < 30,
      isSick: liveState === 'SICK',
      isDead: liveState === 'DEAD',
    };

    return stats;
  }

  async interact(userId: string, interactDto: InteractDto): Promise<OdomoStatsDto> {
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found');
    }

    // Vérifier que l'Odomo n'est pas mort
    const stats = await this.getLiveStats(userId);
    if (stats.isDead) {
      throw new BadRequestException('Cannot interact with a dead Odomo');
    }

    // Calculer les nouvelles valeurs
    const now = new Date();
    let newHunger = stats.hunger;
    let newHappiness = stats.happiness;
    let newHygiene = stats.hygiene;
    let newLifeState: LifeState = stats.isSick ? 'SICK' : 'ALIVE';

    switch (interactDto.type) {
      case InteractionType.FEED:
        newHunger = Math.min(100, newHunger + interactDto.amount);
        newHappiness = Math.min(100, newHappiness + 5); // bonus de bonheur
        break;

      case InteractionType.CLEAN:
        newHygiene = Math.min(100, newHygiene + interactDto.amount);
        newHappiness = Math.min(100, newHappiness + 5);
        break;

      case InteractionType.HEAL:
        if (!stats.isSick) {
          throw new BadRequestException('Odomo is not sick');
        }
        newLifeState = 'ALIVE';
        newHappiness = Math.min(100, newHappiness + 10);
        break;
    }

    // Mettre à jour l'Odomo
    const updated = await this.prisma.odomo.update({
      where: { userId },
      data: {
        hunger: newHunger,
        happiness: newHappiness,
        hygiene: newHygiene,
        lifeState: newLifeState,
        lastInteractionAt: now,
      },
    });

    // Retourner les stats fraîches
    return this.getLiveStats(userId);
  }

  async addExperience(userId: string, amount: number): Promise<OdomoStatsDto> {
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found');
    }

    const stats = await this.getLiveStats(userId);
    if (stats.isDead) {
      throw new BadRequestException('Cannot add XP to a dead Odomo');
    }

    // Calculer le nouveau XP et niveau
    let newXp = odomo.xp + amount;
    let newLevel = odomo.level;
    let newStage: Stage = odomo.stage;

    // Calculer les niveaux gagnés avec système progressif
    while (true) {
      const xpNeeded = getXpRequiredForLevel(newLevel);

      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel++;
      } else {
        break;
      }
    }

    // Déterminer le nouveau stage basé sur le niveau
    if (newLevel >= STAGE_REQUIREMENTS.KAGE) {
      newStage = 'KAGE';
    } else if (newLevel >= STAGE_REQUIREMENTS.JONIN) {
      newStage = 'JONIN';
    } else if (newLevel >= STAGE_REQUIREMENTS.CHUNIN) {
      newStage = 'CHUNIN';
    } else if (newLevel >= STAGE_REQUIREMENTS.GENIN) {
      newStage = 'GENIN';
    } else if (newLevel >= STAGE_REQUIREMENTS.CHIBI) {
      newStage = 'CHIBI';
    }

    // Mettre à jour l'Odomo
    await this.prisma.odomo.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        stage: newStage,
        happiness: Math.min(100, stats.happiness + 10), // bonus de bonheur pour l'évolution
      },
    });

    return this.getLiveStats(userId);
  }

  async delete(userId: string): Promise<void> {
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found');
    }

    await this.prisma.odomo.delete({
      where: { userId },
    });
  }
}
