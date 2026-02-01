import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { OdomoService } from './odomo.service.js';
import { CreateOdomoDto } from './dto/create-odomo.dto.js';
import { InteractDto } from './dto/interact.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';

@Controller('odomo')
export class OdomoController {
  constructor(private readonly odomoService: OdomoService) { }

  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() createOdomoDto: CreateOdomoDto,
  ) {
    return this.odomoService.create(userId, createOdomoDto);
  }

  @Get()
  async getStats(@GetUser('id') userId: string) {
    return this.odomoService.getLiveStats(userId);
  }

  @Post('interact')
  async interact(
    @GetUser('id') userId: string,
    @Body() interactDto: InteractDto,
  ) {
    return this.odomoService.interact(userId, interactDto);
  }

  @Post('xp')
  async addXp(
    @GetUser('id') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.odomoService.addExperience(userId, amount);
  }

  @Delete()
  async delete(@GetUser('id') userId: string) {
    await this.odomoService.delete(userId);
    return { message: 'Odomo deleted successfully' };
  }
}
