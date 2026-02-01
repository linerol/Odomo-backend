import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncStepsDto } from './dto/sync-steps.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @Post('steps')
  async syncSteps(
    @GetUser('id') userId: string,
    @Body() syncStepsDto: SyncStepsDto,
  ) {
    return this.syncService.syncSteps(userId, syncStepsDto);
  }
}
