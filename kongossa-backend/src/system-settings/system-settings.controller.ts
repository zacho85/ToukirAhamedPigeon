import { Controller, Get, Post, Body } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  @Post()
  createSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.service.createSettings(dto);
  }
}
 