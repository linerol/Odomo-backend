import { IsEnum } from 'class-validator';
import { ItemType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UseItemDto {
  @ApiProperty({ enum: ItemType, example: 'ONIGIRI', description: 'Type of item to use' })
  @IsEnum(ItemType, { message: 'Invalid item type' })
  itemType: ItemType;
}
