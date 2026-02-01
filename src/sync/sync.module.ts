import { Module } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncController } from './sync.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OdomoModule } from '../odomo/odomo.module.js';

@Module({
  imports: [PrismaModule, OdomoModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule { }
