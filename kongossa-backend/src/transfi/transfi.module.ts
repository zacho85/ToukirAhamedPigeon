import { Module } from '@nestjs/common';
import { TransfiService } from './transfi.service';
import { TransfiController } from './transfi.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [TransfiController],
  providers: [TransfiService],
  exports: [TransfiService],
})
export class TransfiModule {}
