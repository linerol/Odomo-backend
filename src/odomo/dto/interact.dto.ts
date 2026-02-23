import { IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InteractionType {
  FEED = 'FEED',
  CLEAN = 'CLEAN',
  HEAL = 'HEAL',
}

export class InteractDto {
  @ApiProperty({ enum: InteractionType, example: InteractionType.FEED, description: 'Type of interaction' })
  @IsEnum(InteractionType)
  type: InteractionType;

  @ApiProperty({ example: 30, description: 'Amount of interaction point (1-100)', required: false, default: 30 })
  @IsNumber()
  @Min(1)
  @Max(100)
  amount: number = 30; // Valeur par défaut
}
