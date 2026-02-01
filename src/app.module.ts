import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AtGuard } from './auth/guards/at.guard.js';
import { OdomoModule } from './odomo/odomo.module.js';
import { SyncModule } from './sync/sync.module.js';
import { InventoryModule } from './inventory/inventory.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, OdomoModule, SyncModule, InventoryModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule { }
