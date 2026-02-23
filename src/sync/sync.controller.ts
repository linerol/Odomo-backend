import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncStepsDto } from './dto/sync-steps.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SyncResponseDto } from './dto/sync-response.dto.js';

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @Post('steps')
  @ApiOperation({ summary: 'Sync steps to gain XP and Kobans' })
  @ApiResponse({ status: 201, description: 'Steps synced successfully.', type: SyncResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid steps or dead Odomo.' })
  @ApiResponse({ status: 404, description: 'Odomo not found.' })
  async syncSteps(
    @GetUser('id') userId: string,
    @Body() syncStepsDto: SyncStepsDto,
  ) {
    return this.syncService.syncSteps(userId, syncStepsDto);
  }
}
