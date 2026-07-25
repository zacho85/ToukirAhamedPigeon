import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../prisma/prisma.module';
// Don't import RolesGuard here - it's used directly in controllers

@Module({
  imports: [PrismaModule],
  providers: [RolesService], // Only RolesService
  controllers: [RolesController],
  exports: [RolesService], // Only export RolesService
})
export class RolesModule {}