import { IsEnum } from 'class-validator';
import { ItemType } from '@prisma/client';

export class UseItemDto {
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;
}
