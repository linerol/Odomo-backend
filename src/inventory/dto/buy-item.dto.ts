import { IsEnum, IsInt, Min } from 'class-validator';
import { ItemType } from '@prisma/client';

export class BuyItemDto {
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
