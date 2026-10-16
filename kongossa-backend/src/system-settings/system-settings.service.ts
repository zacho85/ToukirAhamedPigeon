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

  // ✅ Always create new row (history preserved). Fields the request leaves
  // out keep their current value instead of falling back to the defaults.
  async createSettings(data: UpdateSystemSettingsDto) {
    const latest = await this.getSettings();
    const current = latest
      ? (({ id, createdAt, updatedAt, ...values }) => values)(latest)
      : {};
    return this.prisma.systemSettings.create({
      data: { ...current, ...data },
    });
  }

  // ❌ Optional: disable PATCH completely
  async updateSettings() {
    throw new Error('Updating settings is disabled. Create a new version instead.');
  }
}
