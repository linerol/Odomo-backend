import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { BuyItemDto } from './dto/buy-item.dto.js';
import { UseItemDto } from './dto/use-item.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get()
  async getInventory(@GetUser('id') userId: string) {
    return this.inventoryService.getInventory(userId);
  }

  @Post('buy')
  async buyItem(
    @GetUser('id') userId: string,
    @Body() buyItemDto: BuyItemDto,
  ) {
    return this.inventoryService.buyItem(userId, buyItemDto);
  }

  @Post('use')
  async useItem(
    @GetUser('id') userId: string,
    @Body() useItemDto: UseItemDto,
  ) {
    return this.inventoryService.useItem(userId, useItemDto);
  }
}
