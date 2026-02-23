import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { BuyItemDto } from './dto/buy-item.dto.js';
import { UseItemDto } from './dto/use-item.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get()
  @ApiOperation({ summary: 'Get user inventory' })
  @ApiResponse({ status: 200, description: 'Return user inventory.' })
  async getInventory(@GetUser('id') userId: string) {
    return this.inventoryService.getInventory(userId);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Buy an item from shop' })
  @ApiResponse({ status: 201, description: 'Item bought successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient funds.' })
  async buyItem(
    @GetUser('id') userId: string,
    @Body() buyItemDto: BuyItemDto,
  ) {
    return this.inventoryService.buyItem(userId, buyItemDto);
  }

  @Post('use')
  @ApiOperation({ summary: 'Use an item from inventory' })
  @ApiResponse({ status: 201, description: 'Item used successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found in inventory.' })
  async useItem(
    @GetUser('id') userId: string,
    @Body() useItemDto: UseItemDto,
  ) {
    return this.inventoryService.useItem(userId, useItemDto);
  }
}
