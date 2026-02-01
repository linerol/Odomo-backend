export class OdomoStatsDto {
  id: string;
  userId: string;
  name: string;
  level: number;
  xp: number;
  stage: string;
  evolutionVariant: string | null;

  // Stats calculées en temps réel
  hunger: number;
  happiness: number;
  hygiene: number;

  lifeState: string;
  birthDate: Date;
  lastInteractionAt: Date;
  lastStepSyncAt: Date;

  // Info supplémentaire
  timeSinceLastInteraction: number; // en heures
  needsAttention: boolean;
  isSick: boolean;
  isDead: boolean;
}
