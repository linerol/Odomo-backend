import { ApiProperty } from '@nestjs/swagger';

export class OdomoStatsDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  level: number;
  @ApiProperty()
  xp: number;
  @ApiProperty()
  maxXp: number;
  @ApiProperty()
  stage: string;
  @ApiProperty({ nullable: true })
  evolutionVariant: string | null;

  // Stats calculées en temps réel
  @ApiProperty()
  hunger: number;
  @ApiProperty()
  happiness: number;
  @ApiProperty()
  hygiene: number;

  @ApiProperty()
  lifeState: string;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  lastInteractionAt: Date;
  @ApiProperty()
  lastStepSyncAt: Date;

  // Info supplémentaire
  @ApiProperty()
  timeSinceLastInteraction: number; // en heures
  @ApiProperty()
  needsAttention: boolean;
  @ApiProperty()
  isSick: boolean;
  @ApiProperty()
  isDead: boolean;
}
