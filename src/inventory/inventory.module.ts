import { Module, forwardRef } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { InventoryController } from './inventory.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OdomoModule } from '../odomo/odomo.module.js';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => OdomoModule), // Évite la dépendance circulaire
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule { }
