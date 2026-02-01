import { Module } from '@nestjs/common';
import { OdomoService } from './odomo.service.js';
import { OdomoController } from './odomo.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OdomoController],
  providers: [OdomoService],
  exports: [OdomoService],
})
export class OdomoModule { }
