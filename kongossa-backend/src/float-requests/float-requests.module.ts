import { Module } from '@nestjs/common';
import { FloatRequestsService } from './float-requests.service';
import { FloatRequestsController } from './float-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FloatRequestsController],
  providers: [FloatRequestsService],
})
export class FloatRequestsModule {}
