import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('System Settings')
@ApiBearerAuth('bearer')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  /** Fees are a central decision: only superadmin holds this permission (the Fee Management Save button). */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:fee-management')
  createSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.service.createSettings(dto);
  }
}
 