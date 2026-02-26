import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { OdomoService } from './odomo.service.js';
import { CreateOdomoDto } from './dto/create-odomo.dto.js';
import { InteractDto } from './dto/interact.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OdomoStatsDto } from './dto/odomo-stats.dto.js';
import { SetStatsDto } from './dto/set-stats.dto.js';

@ApiTags('Odomo')
@ApiBearerAuth()
@Controller('odomo')
export class OdomoController {
  constructor(private readonly odomoService: OdomoService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new Odomo (Birth)' })
  @ApiResponse({ status: 201, description: 'Odomo created successfully.' })
  @ApiResponse({ status: 409, description: 'User already has an Odomo.' })
  async create(
    @GetUser('id') userId: string,
    @Body() createOdomoDto: CreateOdomoDto,
  ) {
    return this.odomoService.create(userId, createOdomoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current Odomo live stats' })
  @ApiResponse({ status: 200, description: 'Return Odomo stats.', type: OdomoStatsDto })
  @ApiResponse({ status: 404, description: 'Odomo not found.' })
  async getStats(@GetUser('id') userId: string) {
    return this.odomoService.getLiveStats(userId);
  }

  @Post('interact')
  @ApiOperation({ summary: 'Interact with Odomo (Feed, Clean, Heal)' })
  @ApiResponse({ status: 200, description: 'Interaction successful, returns updated stats.', type: OdomoStatsDto })
  @ApiResponse({ status: 400, description: 'Invalid interaction or dead Odomo.' })
  async interact(
    @GetUser('id') userId: string,
    @Body() interactDto: InteractDto,
  ) {
    return this.odomoService.interact(userId, interactDto);
  }

  @Post('xp')
  @ApiOperation({ summary: 'Dev: Add XP manually' })
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'XP added.', type: OdomoStatsDto })
  async addXp(
    @GetUser('id') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.odomoService.addExperience(userId, amount);
  }

  @Post('kobans')
  @ApiOperation({ summary: 'Dev: Add Kobans manually' })
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Kobans added.' })
  async addKobans(
    @GetUser('id') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.odomoService.addKobans(userId, amount);
  }

  @Post('stats/set')
  @ApiOperation({ summary: 'Dev: explicitly set Odomo stats (hunger, happiness, hygiene)' })
  @ApiResponse({ status: 200, description: 'Stats updated successfully.', type: OdomoStatsDto })
  @ApiResponse({ status: 404, description: 'Odomo not found.' })
  async setStats(
    @GetUser('id') userId: string,
    @Body() setStatsDto: SetStatsDto,
  ) {
    return this.odomoService.setStats(userId, setStatsDto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Dev: Reset account (Odomo to birth state, Kobans to 0, clear inventory)' })
  @ApiResponse({ status: 200, description: 'Account reset successfully.', type: OdomoStatsDto })
  @ApiResponse({ status: 404, description: 'Odomo not found.' })
  async resetAccount(@GetUser('id') userId: string) {
    return this.odomoService.resetAccount(userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Odomo' })
  @ApiResponse({ status: 200, description: 'Odomo deleted.' })
  async delete(@GetUser('id') userId: string) {
    await this.odomoService.delete(userId);
    return { message: 'Odomo deleted successfully' };
  }
}
