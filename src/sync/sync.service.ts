import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OdomoService } from '../odomo/odomo.service.js';
import { SyncStepsDto } from './dto/sync-steps.dto.js';
import { SyncResponseDto } from './dto/sync-response.dto.js';
import type { Stage } from '@prisma/client';

// Constantes de conversion
const XP_PER_STEP = 0.1; // 1 XP pour 10 pas
const KOBANS_PER_100_STEPS = 1; // 1 Koban pour 100 pas

// Fonction pour calculer l'XP requis pour passer au niveau suivant
const getXpRequiredForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Déterminer le stage selon le niveau
const STAGE_REQUIREMENTS = {
  TAMAGO: 0,
  CHIBI: 1,
  GENIN: 5,
  CHUNIN: 10,
  JONIN: 20,
  KAGE: 50,
};

const getStageForLevel = (level: number): Stage => {
  if (level >= STAGE_REQUIREMENTS.KAGE) return 'KAGE';
  if (level >= STAGE_REQUIREMENTS.JONIN) return 'JONIN';
  if (level >= STAGE_REQUIREMENTS.CHUNIN) return 'CHUNIN';
  if (level >= STAGE_REQUIREMENTS.GENIN) return 'GENIN';
  if (level >= STAGE_REQUIREMENTS.CHIBI) return 'CHIBI';
  return 'TAMAGO';
};

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly odomoService: OdomoService,
  ) { }

  async syncSteps(userId: string, syncStepsDto: SyncStepsDto): Promise<SyncResponseDto> {
    const { steps } = syncStepsDto;

    if (steps === 0) {
      throw new BadRequestException('Cannot sync 0 steps');
    }

    // Calculer les gains
    const xpGained = Math.floor(steps * XP_PER_STEP);
    const kobansGained = Math.floor(steps / 100) * KOBANS_PER_100_STEPS;

    // Récupérer l'Odomo et l'User AVANT la transaction
    const odomo = await this.prisma.odomo.findUnique({
      where: { userId },
    });

    if (!odomo) {
      throw new NotFoundException('Odomo not found. Create one first.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier que l'Odomo n'est pas mort
    const stats = await this.odomoService.getLiveStats(userId);
    if (stats.isDead) {
      throw new BadRequestException('Cannot sync steps for a dead Odomo');
    }

    // Sauvegarder l'état avant pour détecter les changements
    const oldLevel = odomo.level;
    const oldStage = odomo.stage;

    // Calculer le nouveau niveau et XP
    let newXp = odomo.xp + xpGained;
    let newLevel = odomo.level;

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

    const newStage = getStageForLevel(newLevel);
    const newKobanBalance = user.kobanBalance + kobansGained;

    // 🔒 TRANSACTION ATOMIQUE PRISMA
    // Garantit que TOUT passe ou RIEN ne passe (anti-triche)
    await this.prisma.$transaction([
      // 1. Mettre à jour les Kobans de l'utilisateur
      this.prisma.user.update({
        where: { id: userId },
        data: {
          kobanBalance: newKobanBalance,
        },
      }),

      // 2. Mettre à jour l'Odomo (XP, level, stage, lastStepSyncAt)
      this.prisma.odomo.update({
        where: { userId },
        data: {
          xp: newXp,
          level: newLevel,
          stage: newStage,
          lastStepSyncAt: new Date(),
          // Bonus de bonheur si level up
          ...(newLevel > oldLevel && {
            happiness: Math.min(100, stats.happiness + (newLevel - oldLevel) * 5),
          }),
        },
      }),
    ]);

    // Récupérer les stats fraîches après la transaction
    const updatedStats = await this.odomoService.getLiveStats(userId);

    // Construire la réponse
    const response: SyncResponseDto = {
      xpGained,
      kobansGained,
      newKobanBalance,
      odomo: updatedStats,
      leveledUp: newLevel > oldLevel,
      stageEvolved: newStage !== oldStage,
    };

    return response;
  }
}
