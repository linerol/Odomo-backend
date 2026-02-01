import { IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum InteractionType {
  FEED = 'FEED',
  CLEAN = 'CLEAN',
  HEAL = 'HEAL',
}

export class InteractDto {
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsNumber()
  @Min(1)
  @Max(100)
  amount: number = 30; // Valeur par défaut
}
