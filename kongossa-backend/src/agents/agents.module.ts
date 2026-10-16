import { Module } from '@nestjs/common';
import { FeesModule } from '../fees/fees.module';
import { AgentsController } from './agents.controller';
import { AgentRequestsController } from './agent-requests.controller';
import { AgentsService } from './agents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, OtpModule, MailModule, FeesModule],
  controllers: [AgentsController, AgentRequestsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}