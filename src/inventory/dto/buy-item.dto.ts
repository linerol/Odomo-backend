import { IsEnum, IsInt, Min } from 'class-validator';
import { ItemType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BuyItemDto {
  @ApiProperty({ enum: ItemType, example: 'ONIGIRI', description: 'Type of item to buy' })
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;

  @ApiProperty({ example: 1, description: 'Quantity to buy', minimum: 1 })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
