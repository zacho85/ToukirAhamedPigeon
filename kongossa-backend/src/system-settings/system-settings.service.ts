import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Always return latest settings
  async getSettings() {
    return this.prisma.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Always create new row (history preserved)
  async createSettings(data: UpdateSystemSettingsDto) {
    return this.prisma.systemSettings.create({
      data,
    });
  }

  // ❌ Optional: disable PATCH completely
  async updateSettings() {
    throw new Error('Updating settings is disabled. Create a new version instead.');
  }
}
